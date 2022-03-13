//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Garant {
    uint32 dealId;

    enum DealStatus {
        OPENED,
        CLOSED
    }

    struct DealSide {
        bool confirmed;
        uint256 amount; // Amount of tokens
        address tokenAddress; // Smart-contract address of token (0x00000 if ETH)
        address payable sender; // Address of sender
    }

    struct Deal {
        DealSide creator;
        DealSide acceptor;
        DealStatus status;
    }

    mapping(uint32 => Deal) public deals;

    // Create a deal by depositing tokens
    function createDeal(uint256 _amount, address _tokenAddress) public payable {
        uint256 amount = getPassedTokensAmount(_amount, _tokenAddress);

        Deal storage deal = deals[dealId++];

        deal.creator = DealSide({
            confirmed: false,
            sender: payable(msg.sender),
            amount: amount,
            tokenAddress: _tokenAddress
        });
        deal.status = DealStatus.OPENED;
    }

    // Join the deal by depositing tokens
    function joinDeal(
        uint32 _dealId,
        uint256 _amount,
        address _tokenAddress
    ) public payable dealOpened(_dealId) {
        require(
            deals[_dealId].acceptor.sender == address(0),
            "This deal is already taken"
        );

        uint256 amount = getPassedTokensAmount(_amount, _tokenAddress);

        Deal storage deal = deals[_dealId];

        deal.acceptor = DealSide({
            confirmed: false,
            sender: payable(msg.sender),
            amount: amount,
            tokenAddress: _tokenAddress
        });
    }

    // Both sides should confirm the deal.
    // When both confirmed make a deal
    function confirmDeal(uint32 _dealId)
        public
        dealer(_dealId)
        dealOpened(_dealId)
    {
        Deal storage deal = deals[_dealId];

        require(
            deals[_dealId].acceptor.sender != address(0),
            "You cannot confirm deal with one user"
        );

        DealSide memory creator = deal.creator;
        DealSide memory acceptor = deal.acceptor;

        if (creator.sender == msg.sender) {
            deal.creator.confirmed = true;
        } else {
            deal.acceptor.confirmed = true;
        }

        // If both sides confirmed make the deal
        if (deal.creator.confirmed && deal.acceptor.confirmed) {
            // Send acceptor tokens to creator
            sendToken(acceptor.sender, creator.amount, creator.tokenAddress);
            // Send creator tokens to acceptor
            sendToken(creator.sender, acceptor.amount, acceptor.tokenAddress);

            deal.status = DealStatus.CLOSED;
        }
    }

    // Both sides can decline deal.
    // Sides get their tokens back.
    function declineDeal(uint32 _dealId)
        public
        dealer(_dealId)
        dealOpened(_dealId)
    {
        Deal storage deal = deals[_dealId];
        DealSide memory creator = deal.creator;
        DealSide memory acceptor = deal.acceptor;

        // Return tokens to creator
        sendToken(creator.sender, creator.amount, creator.tokenAddress);
        // Return tokens to acceptor
        sendToken(acceptor.sender, acceptor.amount, acceptor.tokenAddress);

        deal.status = DealStatus.CLOSED;
    }

    // Send ERC-20 or ETH to receiver
    function sendToken(
        address payable _receiver,
        uint256 _amount,
        address _tokenAddress
    ) private {
        if (_amount > 0) {
            if (_tokenAddress == address(0)) {
                // If ETH
                _receiver.transfer(_amount);
            } else {
                // If ERC-20
                ERC20 tokenContract = ERC20(_tokenAddress);
                tokenContract.transfer(_receiver, _amount);
            }
        }
    }

    function getPassedTokensAmount(uint256 _amount, address _tokenAddress)
        private
        returns (uint256)
    {
        if (msg.value > 0) {
            require(
                _tokenAddress == address(0) && _amount == 0,
                "You cannot pass amount and tokenAddress when depositing ETH"
            );
            _amount = msg.value;
        } else {
            ERC20 tokenContract = ERC20(_tokenAddress);
            tokenContract.transferFrom(msg.sender, address(this), _amount);
        }

        return _amount;
    }

    // Sender should participate in deal. Creator or acceptor.
    modifier dealer(uint32 _dealId) {
        require(
            deals[_dealId].creator.sender == msg.sender ||
                deals[_dealId].acceptor.sender == msg.sender,
            "You are not participating in this deal"
        );
        _;
    }

    // Deal should be active
    modifier dealOpened(uint32 _dealId) {
        require(
            deals[_dealId].status == DealStatus.OPENED,
            "Deal is already closed"
        );
        _;
    }
}
