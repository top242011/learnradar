// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'; // นำเข้า Bootstrap CSS
import './globals.css'; // นำเข้า Global Styles ของเรา
import { Inter } from 'next/font/google'; // สามารถเปลี่ยน font ได้ตามต้องการ

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}