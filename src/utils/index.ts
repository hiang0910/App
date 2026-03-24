/**
 * Hàm định dạng thời gian từ miliseconds sang chuỗi mm:ss
 * @param millis Số miliseconds (ví dụ: 120000)
 * @returns Chuỗi định dạng (ví dụ: "2:00")
 */
export const formatTime = (millis: number): string => {
  if (!millis || isNaN(millis) || millis < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Đảm bảo giây luôn có 2 chữ số (ví dụ: 05 thay vì 5)
  const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutes}:${displaySeconds}`;
};

// Nếu sau này em có thêm các hàm helper khác (như cắt chữ, xử lý mảng), 
// em cũng sẽ viết export const ở đây.