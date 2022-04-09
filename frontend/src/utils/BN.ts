import { BigNumber } from 'ethers';

export class OwnBigNumber extends BigNumber {
	static fromDecimal(value: number | string, decimals: string): BigNumber {
		if (typeof value === 'number') {
			value = value.toFixed(10).replace(/\.?0+$/, '');
		}

		value = value.replace(',', '.');

		const pointerIdx = value.indexOf('.');

		if (pointerIdx > 0) {
			value = value.replace('.', '');

			for (let i = +decimals - (value.length - pointerIdx); i > 0; i--) {
				value = value + '0';
			}

			return BigNumber.from(value);
		}

		return BigNumber.from(value).mul(BigNumber.from('10').pow(BigNumber.from(decimals)));
	}

	static toStringDecimals(value: string, decimals: string): string {
		for (let i = value.length; i <= +decimals; i++) {
			value = '0' + value;
		}

		return parseFloat(
			value.slice(0, value.length - +decimals) + '.' + value.slice(value.length - +decimals)
		).toString();
	}
}
