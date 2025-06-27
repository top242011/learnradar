// app/layout.tsx
import './globals.css'
// import { Inter } from 'next/font/google' // ไม่จำเป็นต้องใช้ Inter ถ้าจะใช้ IBM Plex Sans Thai เป็นฟอนต์หลัก
import 'bootstrap/dist/css/bootstrap.min.css';

// const inter = Inter({ subsets: ['latin'] }) // คอมเมนต์หรือลบบรรทัดนี้ออก

export const metadata = {
  title: 'Learn Radar - รีวิววิชาเรียนสำหรับนักศึกษา',
  description: 'รีวิววิชาเรียนสำหรับนักศึกษา',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      {/* ลบ className={inter.className} ออกจากแท็ก body */}
      <body>
        {children}
      </body>
    </html>
  )
}