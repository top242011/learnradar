// app/page.tsx
'use client';

import Head from 'next/head';
import { Navbar, Nav, Button, Container, Row, Col, Form, InputGroup, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react'; // นำเข้า useState และ useEffect
import { supabase } from '../utils/supabaseClient'; // ยกเลิกคอมเมนต์บรรทัดนี้

// Define interfaces for component props to ensure type safety in TypeScript
interface Course { // เปลี่ยนชื่อ interface จาก CourseCardProps เป็น Course
  id: string; // เพิ่ม id สำหรับ key ในการ map
  code: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  students: number;
  credits: number;
  preview: string;
}

interface TrendingCourse { // เปลี่ยนชื่อ interface จาก TrendingCourseItemProps เป็น TrendingCourse
  id: string; // เพิ่ม id สำหรับ key ในการ map
  title: string;
  rating: number;
  reviews: number;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<TrendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('courses') // เปลี่ยน 'courses' เป็นชื่อตารางวิชาเรียนของคุณใน Supabase
        .select('*'); // ดึงทุกคอลัมน์ หรือระบุคอลัมน์ที่ต้องการ
      
      if (error) {
        console.error('Error fetching courses:', error);
        setError('ไม่สามารถโหลดวิชาเรียนได้: ' + error.message);
      } else {
        setCourses(data as Course[]);
      }
      setLoading(false);
    }

    async function fetchTrendingCourses() {
      const { data, error } = await supabase
        .from('trending_courses') // เปลี่ยน 'trending_courses' เป็นชื่อตารางวิชายอดนิยมของคุณใน Supabase
        .select('*')
        .order('reviews', { ascending: false }) // ตัวอย่าง: เรียงตามจำนวนรีวิวสูงสุด
        .limit(5); // ตัวอย่าง: ดึงมา 5 รายการ

      if (error) {
        console.error('Error fetching trending courses:', error);
        // ไม่ต้อง set error ทับกัน เพราะ error หลักจะแสดงผลรวม
      } else {
        setTrendingCourses(data as TrendingCourse[]);
      }
    }

    fetchCourses();
    fetchTrendingCourses();
  }, []); // [] หมายความว่า useEffect จะทำงานแค่ครั้งเดียวเมื่อ Component mount

  // CourseCard Component: Displays individual course information
  const CourseCard = ({ code, title, instructor, rating, reviews, students, credits, preview }: Course) => (
    <Card className="course-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className="course-code">{code}</span>
          <div className="rating d-flex align-items-center">
            <span className="stars">{'★'.repeat(Math.floor(rating))}</span>
            <span className="ms-1">{rating}</span>
          </div>
        </div>
        <Card.Title className="course-title">{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted course-instructor">{instructor}</Card.Subtitle>
        <div className="d-flex justify-content-between mb-3 font-size-small course-stats">
          <span className="stat-item">📚 {reviews} รีวิว</span>
          <span className="stat-item">👥 {students} คน</span>
          <span className="stat-item">⏱️ {credits} หน่วยกิต</span>
        </div>
        <Card.Text className="course-preview">{preview}</Card.Text>
      </Card.Body>
    </Card>
  );

  // TrendingCourseItem Component: Displays popular courses in the sidebar
  const TrendingCourseItem = ({ title, rating, reviews }: TrendingCourse) => (
    <li>
      <div className="trending-title">{title}</div>
      <div className="trending-stats">★{rating} • {reviews} รีวิว</div>
    </li>
  );

  return (
    <div>
      <Head>
        <title>Learn Radar - รีวิววิชาเรียนสำหรับนักศึกษา</title>
        <meta name="description" content="เว็บไซต์รีวิววิชาเรียนสำหรับนักศึกษา" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar expand="lg" className="container">
          <Navbar.Brand href="#" className="logo">Learn Radar</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-links">
              <Nav.Link href="#home">หน้าหลัก</Nav.Link>
              <Nav.Link href="#courses">รีวิววิชา</Nav.Link>
              <Nav.Link href="#instructors">อาจารย์</Nav.Link>
              <Nav.Link href="#universities">มหาวิทยาลัย</Nav.Link>
              <Nav.Link href="#about">เกี่ยวกับเรา</Nav.Link>
            </Nav>
            <div className="auth-buttons ms-auto">
              <Button variant="outline-primary" className="btn-secondary me-2">เข้าสู่ระบบ</Button>
              <Button variant="primary" className="btn-primary">สมัครสมาชิก</Button>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-content">
            <h1>รีวิววิชาเรียนจากนักศึกษาจริง</h1>
            <p>ค้นหาวิชาเรียนที่ใช่สำหรับคุณ พร้อมรีวิวจากเพื่อนนักศึกษา</p>
            <Button variant="primary" className="btn-primary">เริ่มค้นหาวิชา</Button>
          </div>
        </section>

        <section className="search-section" id="search">
          <InputGroup className="mb-3 search-container">
            <Form.Control
              type="text"
              className="search-input"
              placeholder="ค้นหาวิชาเรียน อาจารย์ หรือรหัสวิชา..."
            />
            <Button variant="primary" className="btn-primary">ค้นหา</Button>
          </InputGroup>
          <div className="d-flex flex-wrap gap-3 search-filters">
            <Form.Select className="filter-select">
              <option>ทุกมหาวิทยาลัย</option>
              <option>จุฬาลงกรณ์มหาวิทยาลัย</option>
              <option>มหาวิทยาลัยธรรมศาสตร์</option>
              <option>มหาวิทยาลัยมหิดล</option>
            </Form.Select>
            <Form.Select className="filter-select">
              <option>ทุกคณะ</option>
              <option>วิศวกรรมศาสตร์</option>
              <option>แพทยศาสตร์</option>
              <option>ครุศาสตร์</option>
            </Form.Select>
            <Form.Select className="filter-select">
              <option>เรียงตาม</option>
              <option>คะแนนสูงสุด</option>
              <option>รีวิวล่าสุด</option>
              <option>ความนิยม</option>
            </Form.Select>
          </div>
        </section>

        <div className="main-content">
          <section className="courses-section">
            <Row className="g-4">
              {loading && <p>กำลังโหลดวิชาเรียน...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && courses.length === 0 && <p>ไม่พบวิชาเรียน</p>}
              {courses.map((course) => (
                <Col xs={12} md={6} lg={4} key={course.id}> {/* ใช้ course.id เป็น key */}
                  <CourseCard {...course} />
                </Col>
              ))}
            </Row>
          </section>

          <aside className="sidebar">
            <h3>🔥 วิชายอดนิยม</h3>
            <ul className="trending-courses">
              {trendingCourses.length === 0 && <p>ไม่พบวิชายอดนิยม</p>}
              {trendingCourses.map((course) => (
                <TrendingCourseItem key={course.id} {...course} />
              ))}
            </ul>

            <div className="quick-actions mt-4">
              <h3>🚀 มีส่วนร่วมเลย!</h3>
              <Button variant="primary" className="action-btn mb-2">เขียนรีวิว</Button>
              <Button variant="primary" className="action-btn mb-2">ดูประวัติการรีวิว</Button>
              <Button variant="primary" className="action-btn">บันทึกวิชาที่สนใจ</Button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <Container>
          <p>&copy; 2025 Learn Radar. สร้างโดยนักศึกษา เพื่อนักศึกษา</p>
        </Container>
      </footer>

      <div className="floating-add-btn" title="เขียนรีวิวใหม่">
        ✏️
      </div>
    </div>
  );
}