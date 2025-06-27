// app/page.tsx
'use client';

import Head from 'next/head';
import { Navbar, Nav, Button, Container, Row, Col, Form, InputGroup, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// Define interfaces for component props to ensure type safety in TypeScript
interface Course {
  id: string; // คอลัมน์ id สำหรับ key
  university_name: string;
  course_code: string;
  course_name: string;
  faculty: string;
  credits: number;
  // คอลัมน์ด้านล่างนี้จะถูกคำนวณหรือดึงจาก reviews
  instructor: string; // คอลัมน์นี้ยังไม่มีใน courses, อาจต้องเพิ่มหรือใช้ค่าเริ่มต้น
  rating: number; // คะแนนเฉลี่ยจาก reviews
  reviews: number; // จำนวนรีวิว
  students: number; // สมมติว่ามี
  preview: string; // สมมติว่ามี
}

interface TrendingCourse {
  id: string;
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
      // ดึงข้อมูล courses และ JOIN กับ reviews เพื่อดึง rating_overall
      // 'reviews(rating_overall)' จะทำงานได้ก็ต่อเมื่อมี Foreign Key 'course_id' ในตาราง reviews
      const { data, error } = await supabase
        .from('courses')
        .select('*, reviews(rating_overall)'); // ดึงทุกคอลัมน์จาก courses และดึง rating_overall จาก reviews ที่เชื่อมโยงกัน

      if (error) {
        console.error('Error fetching courses:', error);
        setError('ไม่สามารถโหลดวิชาเรียนได้: ' + error.message);
      } else {
        const fetchedCourses: Course[] = data.map((item: any) => {
          // คำนวณคะแนนเฉลี่ยและจำนวนรีวิว
          const reviewsCount = item.reviews ? item.reviews.length : 0;
          let averageRating = 0;
          if (reviewsCount > 0) {
            const totalRating = item.reviews.reduce((sum: number, review: any) => sum + (review.rating_overall || 0), 0);
            averageRating = totalRating / reviewsCount;
          }

          return {
            id: item.id || item.course_code,
            university_name: item.university_name || '',
            course_code: item.course_code || '',
            course_name: item.course_name || '',
            faculty: item.faculty || '',
            credits: item.credits || 0,
            instructor: item.instructor || 'ไม่ระบุ', // หากไม่มีคอลัมน์ instructor ใน courses ให้ใช้ค่าเริ่มต้น
            rating: parseFloat(averageRating.toFixed(1)), // ปัดทศนิยม 1 ตำแหน่ง
            reviews: reviewsCount,
            students: item.students || 0, // หากไม่มีคอลัมน์ students ใน courses ให้ใช้ค่าเริ่มต้น
            preview: item.preview || 'ไม่มีคำอธิบายย่อสำหรับวิชานี้', // หากไม่มีคอลัมน์ preview ใน courses ให้ใช้ค่าเริ่มต้น
          };
        });
        setCourses(fetchedCourses);
      }
      setLoading(false);
    }

    async function fetchTrendingCourses() {
      // ดึงข้อมูลจากตาราง courses และดึง reviews ที่เชื่อมโยงกัน เพื่อคำนวณคะแนน/รีวิว
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_name, reviews(rating_overall)'); // ดึงชื่อวิชาและรีวิวทั้งหมด

      if (error) {
        console.error('Error fetching trending courses:', error);
      } else {
        // คำนวณคะแนนเฉลี่ยและจำนวนรีวิวสำหรับวิชายอดนิยม
        const fetchedTrendingCourses: TrendingCourse[] = data.map((item: any) => {
          const reviewsCount = item.reviews ? item.reviews.length : 0;
          let averageRating = 0;
          if (reviewsCount > 0) {
            const totalRating = item.reviews.reduce((sum: number, review: any) => sum + (review.rating_overall || 0), 0);
            averageRating = totalRating / reviewsCount;
          }

          return {
            id: item.id || item.course_name,
            title: item.course_name || '',
            rating: parseFloat(averageRating.toFixed(1)),
            reviews: reviewsCount,
          };
        }).sort((a, b) => b.reviews - a.reviews) // เรียงตามจำนวนรีวิวมากที่สุด
          .slice(0, 5); // จำกัด 5 รายการ

        setTrendingCourses(fetchedTrendingCourses);
      }
    }

    fetchCourses();
    fetchTrendingCourses();
  }, []);

  // CourseCard Component: Displays individual course information
  const CourseCard = ({ course_code, course_name, instructor, rating, reviews, students, credits, preview, university_name, faculty }: Course) => (
    <Card className="course-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className="course-code">{course_code}</span>
          <div className="rating d-flex align-items-center">
            <span className="stars">{'★'.repeat(Math.floor(rating))}</span>
            <span className="ms-1">{rating}</span>
          </div>
        </div>
        <Card.Title className="course-title">{course_name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted course-instructor">{instructor}</Card.Subtitle>
        <div className="d-flex justify-content-between mb-3 font-size-small course-stats">
          <span className="stat-item">📚 {reviews} รีวิว</span>
          <span className="stat-item">👥 {students} คน</span>
          <span className="stat-item">⏱️ {credits} หน่วยกิต</span>
        </div>
        <Card.Text className="course-preview">{preview}</Card.Text>
        <div className="d-flex justify-content-between font-size-small text-muted mt-2">
            <span>{university_name}</span>
            <span>{faculty}</span>
        </div>
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
                <Col xs={12} md={6} lg={4} key={course.id}>
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