import { expect } from "chai";
import { ethers } from "hardhat";
import { Garant, TestToken1, TestToken2 } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Garant", function () {
  let garant: Garant;
  let testToken1: TestToken1;
  let testToken2: TestToken2;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    user1 = signers[0];
    user2 = signers[1];
    user3 = signers[2];

    const Garant = await ethers.getContractFactory("Garant");
    garant = await Garant.deploy();
    await garant.deployed();

    const TestToken1 = await ethers.getContractFactory("TestToken1");
    testToken1 = await TestToken1.deploy();
    await testToken1.deployed();
    await testToken1.mint(user1.address, 100);

    const TestToken2 = await ethers.getContractFactory("TestToken2");
    testToken2 = await TestToken2.deploy();
    await testToken2.deployed();
    await testToken2.mint(user2.address, 100);
  });

  describe("Creating deal", function () {
    it("Create deal with ERC-20", async function () {
      // Act
      await testToken1.increaseAllowance(garant.address, 100);
      await garant.createDeal(100, testToken1.address);

      // Assert
      const deal = await garant.deals(0);
      // Creator
      expect(deal.creator.amount).to.eq(100);
      expect(deal.creator.tokenAddress).to.eq(testToken1.address);
      expect(deal.creator.sender).to.eq(user1.address);
      expect(deal.creator.confirmed).to.eq(false);
      expect(await testToken1.balanceOf(user1.address)).to.eq(0);
      // Deal
      expect(deal.status).to.eq(0);
      // Contract
      expect(await testToken1.balanceOf(garant.address)).to.eq(100);
    });

    it("Create deal with ETH", async function () {
      // Act
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });

      // Assert
      const deal = await garant.deals(0);
      // Creator
      expect(deal.creator.amount).to.eq(100);
      expect(deal.creator.tokenAddress).to.eq(NULL_ADDRESS);
      expect(deal.creator.sender).to.eq(user1.address);
      expect(deal.creator.confirmed).to.eq(false);
      // Deal
      expect(deal.status).to.eq(0);
      // Contract
      expect(await garant.provider.getBalance(garant.address)).to.eq(100);
    });

    it("Create more than one deal", async function () {
      // Act
      await testToken1.increaseAllowance(garant.address, 50);
      await garant.createDeal(50, testToken1.address);

      await testToken2.connect(user2).increaseAllowance(garant.address, 25);
      await garant.connect(user2).createDeal(25, testToken2.address);

      // Assert
      const firstDeal = await garant.deals(0);
      const secondDeal = await garant.deals(1);
      expect(firstDeal.creator.sender).to.eq(user1.address);
      expect(secondDeal.creator.sender).to.eq(user2.address);
    });

    it("Revert if ETH sent with amount passed", async function () {
      // Act
      const createDealTx = garant.createDeal(100, NULL_ADDRESS, {
        value: 100,
      });

      await expect(createDealTx).to.be.revertedWith(
        "You cannot pass amount and tokenAddress when depositing ETH"
      );
    });

    it("Revert if ETH sent with tokenAddress passed", async function () {
      // Act
      const createDealTx = garant.createDeal(0, testToken1.address, {
        value: 100,
      });

      await expect(createDealTx).to.be.revertedWith(
        "You cannot pass amount and tokenAddress when depositing ETH"
      );
    });
  });

  describe("Join deal", () => {
    it("Join deal with ERC-20", async function () {
      // Arange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await testToken2.connect(user2).increaseAllowance(garant.address, 100);

      // Act
      await garant.connect(user2).joinDeal(0, 100, testToken2.address);

      // Assert
      const deal = await garant.deals(0);
      // Acceptor
      expect(deal.acceptor.amount).to.eq(100);
      expect(deal.acceptor.tokenAddress).to.eq(testToken2.address);
      expect(deal.acceptor.sender).to.eq(user2.address);
      expect(deal.acceptor.confirmed).to.eq(false);
      expect(await testToken2.balanceOf(user2.address)).to.eq(0);
      // Contract
      expect(await testToken2.balanceOf(garant.address)).to.eq(100);
    });

    it("Join deal with ETH", async function () {
      // Arange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });

      // Act
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });

      // Assert
      const deal = await garant.deals(0);
      // Acceptor
      expect(deal.acceptor.amount).to.eq(50);
      expect(deal.acceptor.tokenAddress).to.eq(NULL_ADDRESS);
      expect(deal.acceptor.sender).to.eq(user2.address);
      expect(deal.acceptor.confirmed).to.eq(false);
      // Contract
      expect(await garant.provider.getBalance(garant.address)).to.eq(150);
    });

    it("Revert if ETH sent with amount passed", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });

      // Act
      const joinTx = garant
        .connect(user2)
        .joinDeal(0, 50, NULL_ADDRESS, { value: 50 });

      // Assert
      await expect(joinTx).to.be.revertedWith(
        "You cannot pass amount and tokenAddress when depositing ETH"
      );
    });

    it("Revert if ETH sent with tokenAddress passed", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });

      // Act
      const joinTx = garant
        .connect(user2)
        .joinDeal(0, 0, testToken2.address, { value: 50 });

      // Assert
      await expect(joinTx).to.be.revertedWith(
        "You cannot pass amount and tokenAddress when depositing ETH"
      );
    });

    it("Can not join deal if someone already joined", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });

      // Act
      const joinTx = garant
        .connect(user3)
        .joinDeal(0, 0, testToken2.address, { value: 50 });

      // Assert
      await expect(joinTx).to.be.revertedWith("This deal is already taken");
    });
  });

  describe("Confirm deal", () => {
    it("Tokens not sent after 1 confirmation", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });

      // Act
      await garant.confirmDeal(0);

      // Assert
      expect(await garant.provider.getBalance(garant.address)).to.eq(150);
    });

    it("Tokens sent after 2 confirmations", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await testToken2.connect(user2).increaseAllowance(garant.address, 100);
      await garant.connect(user2).joinDeal(0, 100, testToken2.address);

      // Act
      await garant.connect(user2).confirmDeal(0);
      const user2ETH = await user2.provider?.getBalance(user2.address);
      await garant.confirmDeal(0);

      // Assert
      expect(await garant.provider.getBalance(garant.address)).to.eq(0);
      expect(await user2.provider?.getBalance(user2.address)).to.eq(
        user2ETH?.add(100)
      );
      expect(await testToken2.balanceOf(user1.address)).to.eq(100);
      expect(await testToken2.balanceOf(garant.address)).to.eq(0);
    });

    it("Revert if user not participating in deal", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });

      // Act
      const confirmTx = garant.connect(user3).confirmDeal(0);

      // Assert
      await expect(confirmTx).to.be.revertedWith(
        "You are not participating in this deal"
      );
    });

    it("Revert if only one user in the deal", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });

      // Act
      const confirmTx = garant.confirmDeal(0);

      // Assert
      await expect(confirmTx).to.be.revertedWith(
        "You cannot confirm deal with one user"
      );
    });

    it("Revert if deal is closed", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });
      await garant.confirmDeal(0);
      await garant.connect(user2).confirmDeal(0);

      // Act
      const confirmTx = garant.connect(user2).confirmDeal(0);

      // Assert
      await expect(confirmTx).to.be.revertedWith("Deal is already closed");
    });
  });

  describe("Decline deal", () => {
    it("Creator can decline", async function () {
      // Arrange
      testToken1.increaseAllowance(garant.address, 100);
      await garant.createDeal(100, testToken1.address);

      // Act
      await garant.declineDeal(0);

      // Assert
      const deal = await garant.deals(0);
      expect(deal.status).to.eq(1);
      expect(await garant.provider.getBalance(garant.address)).to.eq(0);
      expect(await testToken1.balanceOf(user1.address)).to.eq(100);
    });

    it("Acceptor can decline", async function () {
      // Arrange
      testToken1.increaseAllowance(garant.address, 100);
      await garant.createDeal(100, testToken1.address);
      testToken2.connect(user2).increaseAllowance(garant.address, 100);
      await garant.connect(user2).joinDeal(0, 100, testToken2.address);

      // Act
      await garant.connect(user2).declineDeal(0);

      // Assert
      const deal = await garant.deals(0);
      expect(deal.status).to.eq(1);
      expect(await garant.provider.getBalance(garant.address)).to.eq(0);
      expect(await testToken1.balanceOf(user1.address)).to.eq(100);
      expect(await testToken2.balanceOf(user2.address)).to.eq(100);
    });

    it("Revert if not participating in deal", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.connect(user2).joinDeal(0, 0, NULL_ADDRESS, { value: 50 });

      // Act
      const revertTx = garant.connect(user3).declineDeal(0);

      // Assert
      await expect(revertTx).to.be.revertedWith(
        "You are not participating in this deal"
      );
    });

    it("Revert if deal is closed", async function () {
      // Arrange
      await garant.createDeal(0, NULL_ADDRESS, { value: 100 });
      await garant.declineDeal(0);

      // Act
      const revertTx = garant.declineDeal(0);

      // Assert
      await expect(revertTx).to.be.revertedWith("Deal is already closed");
    });
  });
});
