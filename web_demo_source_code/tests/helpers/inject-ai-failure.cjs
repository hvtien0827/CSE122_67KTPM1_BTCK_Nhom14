// Tiêm lỗi một lần từ bài kiểm thử, không cần công tắc lỗi trong giao diện sản phẩm.
module.exports = async function injectAIFailure(page, targetTable) {
  await page.evaluate(table => {
    const originalFind = CC.find;
    CC.find = (name, ...args) => {
      if (name === table) {
        CC.find = originalFind;
        throw new Error('Không thể xử lý dữ liệu lúc này. Vui lòng thử lại hoặc sử dụng thao tác thủ công.');
      }
      return originalFind(name, ...args);
    };
  }, targetTable);
};
