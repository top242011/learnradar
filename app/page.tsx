// app/page.tsx
'use client'; // This directive indicates that this is a Client Component

import Head from 'next/head';
import { Navbar, Nav, Button, Container, Row, Col, Form, InputGroup, Card } from 'react-bootstrap';
// import { supabase } from '../utils/supabaseClient'; // Uncomment this line when you start fetching data

// Define interfaces for component props to ensure type safety in TypeScript
interface CourseCardProps {
  code: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  students: number;
  credits: number;
  preview: string;
}

interface TrendingCourseItemProps {
  title: string;
  rating: number;
  reviews: number;
}

export default function Home() {
  // CourseCard Component: Displays individual course information
  // Added h-100 class to Card component to make it take full height of its parent column
  const CourseCard = ({ code, title, instructor, rating, reviews, students, credits, preview }: CourseCardProps) => (
    <Card className="course-card h-100"> {/* Added h-100 here */}
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className="course-code">{code}</span>
          <div className="rating d-flex align-items-center">
            {/* Renders stars based on the rating value */}
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
  const TrendingCourseItem = ({ title, rating, reviews }: TrendingCourseItemProps) => (
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

      {/* Header section with navigation bar */}
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

      {/* Main content area */}
      <main className="container">
        {/* Hero section */}
        <section className="hero">
          <div className="hero-content">
            <h1>รีวิววิชาเรียนจากนักศึกษาจริง</h1>
            <p>ค้นหาวิชาเรียนที่ใช่สำหรับคุณ พร้อมรีวิวจากเพื่อนนักศึกษา</p>
            <Button variant="primary" className="btn-primary">เริ่มค้นหาวิชา</Button>
          </div>
        </section>

        {/* Search and Filter section */}
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
          {/* Courses section displaying course cards */}
          <section className="courses-section">
            {/* Using React-Bootstrap Row and Col for responsive grid layout */}
            {/* g-4 provides spacing (gutter) between columns */}
            <Row className="g-4">
              {/* Each Col defines how much space a CourseCard takes on different screen sizes */}
              {/* xs={12}: Full width on extra small screens (1 column) */}
              {/* md={6}: Half width on medium screens (2 columns) */}
              {/* lg={4}: One-third width on large screens (3 columns) */}
              <Col xs={12} md={6} lg={4}>
                <CourseCard
                  code="CS101"
                  title="Introduction to Computer Science"
                  instructor="อ.ดร.สมชาย ใจดี"
                  rating={4.8}
                  reviews={127}
                  students={580}
                  credits={3}
                  preview="วิชาพื้นฐานการเขียนโปรแกรม สอนดีมาก อาจารย์ใจดี ใช้ Python เป็นหลัก มีแลปทุกสัปดาห์..."
                />
              </Col>
              <Col xs={12} md={6} lg={4}>
                <CourseCard
                  code="MATH201"
                  title="Calculus II"
                  instructor="อ.ดร.วิภา คณิตคม"
                  rating={4.2}
                  reviews={89}
                  students={320}
                  credits={3}
                  preview="คณิตศาสตร์ระดับกลาง ต้องทำโจทย์เยอะ แต่อาจารย์สอนละเอียด มีการบ้านทุกสัปดาห์..."
                />
              </Col>
              <Col xs={12} md={6} lg={4}>
                <CourseCard
                  code="ENG301"
                  title="Advanced English Communication"
                  instructor="Prof. Sarah Johnson"
                  rating={4.9}
                  reviews={156}
                  students={240}
                  credits={3}
                  preview="คลาสภาษาอังกฤษที่ดีที่สุด! อาจารย์เป็นเจ้าของภาษา สอนสนุก มี activity เยอะ..."
                />
              </Col>
              <Col xs={12} md={6} lg={4}>
                <CourseCard
                  code="BUS205"
                  title="Business Statistics"
                  instructor="อ.ดร.ประเสริฐ สถิติดี"
                  rating={3.6}
                  reviews={74}
                  students={180}
                  credits={3}
                  preview="วิชาสถิติเพื่อธุรกิจ ค่อนข้างยาก ต้องใช้ Excel เยอะ มีสอบกลางเทอมและปลายเทอม..."
                />
              </Col>
            </Row>
          </section>

          {/* Sidebar section */}
          <aside className="sidebar">
            <h3>🔥 วิชายอดนิยม</h3>
            <ul className="trending-courses">
              <TrendingCourseItem title="Introduction to Psychology" rating={4.7} reviews={234} />
              <TrendingCourseItem title="Digital Marketing" rating={4.6} reviews={189} />
              <TrendingCourseItem title="Data Science Fundamentals" rating={4.8} reviews={156} />
              <TrendingCourseItem title="Creative Writing" rating={4.9} reviews={98} />
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

      {/* Footer section */}
      <footer className="footer">
        <Container>
          <p>&copy; 2025 Learn Radar. สร้างโดยนักศึกษา เพื่อนักศึกษา</p>
        </Container>
      </footer>

      {/* Floating Add Button for new reviews */}
      <div className="floating-add-btn" title="เขียนรีวิวใหม่">
        ✏️
      </div>
    </div>
  );
}
