// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'; // นำเข้า Bootstrap CSS
import './globals.css'; // นำเข้า Global Styles ของเรา
// ลบบรรทัด import { Inter } from 'next/font/google'; ออกไป
// ลบบรรทัด const inter = Inter({ subsets: ['latin'] }); ออกไป

export const metadata = {
  title: 'Learn Radar - รีวิววิชาเรียนสำหรับนักศึกษา',
  description: 'ค้นหาวิชาเรียนที่ใช่สำหรับคุณ พร้อมรีวิวจากเพื่อนนักศึกษา',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        {/* เพิ่มลิงก์ Google Fonts สำหรับ IBM Plex Sans Thai ตรงนี้ */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      {/* ลบ className={inter.className} ออกจากแท็ก body */}
      <body>{children}</body>
    </html>
  );
}