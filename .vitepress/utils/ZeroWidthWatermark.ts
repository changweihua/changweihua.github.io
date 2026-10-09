/**
 * 零宽字符隐形水印工具类
 * 核心功能：文本水印加密、隐形水印解密
 * 适用场景：前端版权保护、内容溯源、防搬运追责
 */
export class ZeroWidthWatermark {
  static #ZERO_CHAR = '\u200B';   // 零宽空格 = 二进制0
  static #ONE_CHAR = '\u200C';    // 零宽不连字 = 二进制1
  static #WATERMARK_PREFIX = '\uFEFF'; // 水印前缀校验符

  /**
   * 加密：给文本添加隐形水印
   * @param {string} text - 原始文本内容
   * @param {string} watermark - 水印信息（用户ID、溯源标识等）
   * @returns {string} 带隐形水印的文本
   */
  static encrypt(text: string, watermark: string) {
    if (!text || typeof text !== 'string' || !watermark) {
      throw new Error('加密失败：文本与水印内容不可为空');
    }

    try {
      const binaryWatermark = this.#textToBinary(watermark);
      const zeroWidthStr = this.#binaryToZeroWidth(binaryWatermark);
      const fullWatermark = this.#WATERMARK_PREFIX + zeroWidthStr;
      return text[0] + fullWatermark + text.slice(1);
    } catch (error) {
      console.error('零宽水印加密异常：', error);
      return text;
    }
  }

  /**
   * 解密：提取文本中的隐形水印
   * @param {string} encryptedText - 带水印的文本
   * @returns {string} 解析后的水印信息/状态提示
   */
  static decrypt(encryptedText: string) {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return '无水印';
    }

    try {
      const zeroWidthChars = encryptedText.match(/[\u200B\u200C\uFEFF]/g) || new Array<string>();
      if (zeroWidthChars.length === 0) return '无水印';

      const prefixIndex = zeroWidthChars.indexOf(this.#WATERMARK_PREFIX);
      if (prefixIndex === -1) return '无水印';
      const validChars = zeroWidthChars.slice(prefixIndex + 1);

      const binaryStr = this.#zeroWidthToBinary(validChars);
      if (!binaryStr || binaryStr.length % 8 !== 0) return '水印格式错误';

      return this.#binaryToText(binaryStr);
    } catch (error) {
      console.error('零宽水印解密异常：', error);
      return '解密失败';
    }
  }

  /** 文本转8位二进制字符串 */
  static #textToBinary(text: string) {
    return Array.from(text)
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  }

  /** 二进制转零宽字符 */
  static #binaryToZeroWidth(binary: string) {
    return binary.split('').map(bit => bit === '0' ? this.#ZERO_CHAR : this.#ONE_CHAR).join('');
  }

  /** 零宽字符转二进制 */
  static #zeroWidthToBinary(chars: string[]) {
    return chars.map(char => char === this.#ZERO_CHAR ? '0' : '1').join('');
  }

  /** 二进制转普通文本 */
  static #binaryToText(binary: string) {
    return Array.from({ length: binary.length / 8 }, (_, i) => {
      const byte = binary.slice(i * 8, (i + 1) * 8);
      return String.fromCharCode(parseInt(byte, 2));
    }).join('');
  }
}


// // 加密：添加隐形溯源水印
// const originalText = "李剑一原创技术文章，禁止未经授权搬运转载";
// const watermarkInfo = "userID:10086|publishTime:20260326|from:李剑一";
// const watermarkedText = ZeroWidthWatermark.encrypt(originalText, watermarkInfo);

// // 解密：提取溯源信息
// const result = ZeroWidthWatermark.decrypt(watermarkedText);
// console.log('解析出水印信息：', result);
