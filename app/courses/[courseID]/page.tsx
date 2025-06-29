// app/courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // นำเข้า useParams เพื่อดึง courseId
import { supabase } from '../../../utils/supabaseClient'; // ปรับเส้นทางให้ถูกต้อง
import styles from './course-reviews.module.css'; // นำเข้า CSS Module

// Interfaces สำหรับข้อมูลที่ดึงมาจาก Supabase
interface CourseData {
  id: string;
  course_code: string;
  course_name: string;
  university_name: string; // อาจต้องเพิ่มใน DB หากยังไม่มี
  faculty: string;         // อาจต้องเพิ่มใน DB หากยังไม่มี
  credits: number;         // อาจต้องเพิ่มใน DB หากยังไม่มี
  instructor: string;      // อาจต้องเพิ่มใน DB หากยังไม่มี
}

interface ReviewData {
  id: string;
  term: string;
  section_number: string | null;
  rating_overall: number;
  rating_difficulty: number | null;
  rating_teaching: number | null;
  rating_homework: number | null;
  tags: string[] | null;
  content: string; // เปลี่ยนจาก main_review_content เป็น content
  tips_review_content: string | null;
  is_anonymous: boolean;
  created_at: string; // เพิ่ม created_at
}

// ย้ายฟังก์ชัน formatDate และ calculateDaysAgo ออกมานอก Component
// เพื่อให้สามารถเรียกใช้ได้ทั้งใน ReviewCard และ CourseReviewsPage
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};

const calculateDaysAgo = (dateString: string) => {
  const reviewDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
  return `${Math.floor(diffDays / 365)} ปีที่แล้ว`;
};


// ReviewCard Component
const ReviewCard = ({ review }: { review: ReviewData }) => {
  const [helpfulCount, setHelpfulCount] = useState(24); // Mock data for helpful count
  const [notHelpfulCount, setNotHelpfulCount] = useState(2); // Mock data for not helpful count
  const [voted, setVoted] = useState(false); // State to prevent multiple votes

  const handleHelpfulClick = () => {
    if (!voted) {
      setHelpfulCount(prev => prev + 1);
      setVoted(true);
    }
  };

  const handleNotHelpfulClick = () => {
    if (!voted) {
      setNotHelpfulCount(prev => prev + 1);
      setVoted(true);
    }
  };

  const getRatingText = (rating: number | null, type: 'difficulty' | 'teaching' | 'homework') => {
    if (rating === null) return 'ไม่ระบุ';
    const labels: { [key: string]: string[] } = {
        difficulty: ['ง่ายมาก', 'ง่าย', 'ปานกลาง', 'ยาก', 'ยากมาก'],
        teaching: ['แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'],
        homework: ['น้อยมาก', 'น้อย', 'ปานกลาง', 'เยอะ', 'เยอะมาก'],
    };
    return labels[type][rating - 1] || 'ไม่ระบุ';
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          <div className={styles.avatar}>
            {review.is_anonymous ? 'A' : (review.created_at ? review.created_at[0].toUpperCase() : 'U')}
          </div>
          <div className={styles.reviewerDetails}>
            {/* แก้ไขการแสดงชื่อนักศึกษาให้ถูกต้องเมื่อไม่ระบุชื่อ */}
            <h4>{review.is_anonymous ? 'Anonymous Student' : `นักศึกษา`}</h4>
            <div className={styles.meta}>
              เรียนเมื่อ: ภาคเรียนที่ {review.term} {review.section_number ? ` • เซคชั่น: ${review.section_number}` : ''} • รีวิวเมื่อ: {calculateDaysAgo(review.created_at)}
            </div>
          </div>
        </div>
        <div className={styles.reviewRating}>
          <span className={styles.stars}>{'★'.repeat(Math.floor(review.rating_overall))}</span>
          <span>{review.rating_overall.toFixed(1)}</span>
        </div>
      </div>

      <div className={styles.reviewContent}>
        {review.tags && review.tags.length > 0 && (
          <div className={styles.reviewCategories}>
            {review.tags.map(tag => (
              <span key={tag} className={styles.categoryTag}>{tag}</span>
            ))}
          </div>
        )}

        <p className={styles.reviewText}>
          {review.content}
          {review.tips_review_content && (
            <>
              <br /><br />
              <strong>เคล็ดลับสำหรับผู้ที่จะมาเรียน:</strong> {review.tips_review_content}
            </>
          )}
        </p>

        <div className={styles.reviewMetrics}>
          <div className={styles.metric}>
            <div className={styles.metricValue}>{review.rating_difficulty?.toFixed(1) || 'N/A'}</div>
            <div className={styles.metricLabel}>ความยาก ({getRatingText(review.rating_difficulty, 'difficulty')})</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricValue}>{review.rating_teaching?.toFixed(1) || 'N/A'}</div>
            <div className={styles.metricLabel}>ครูสอนดี ({getRatingText(review.rating_teaching, 'teaching')})</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricValue}>{review.rating_homework?.toFixed(1) || 'N/A'}</div>
            <div className={styles.metricLabel}>ปริมาณการบ้าน ({getRatingText(review.rating_homework, 'homework')})</div>
          </div>
          {/* คุณสามารถเพิ่ม metric อื่นๆ ได้ตามต้องการ เช่น ประโยชน์, ความน่าสนใจ */}
        </div>
      </div>

      <div className={styles.reviewActions}>
        <div className={styles.helpfulSection}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>รีวิวนี้มีประโยชน์ไหม?</span>
          <button className={styles.helpfulBtn} onClick={handleHelpfulClick} disabled={voted}>
            👍 มีประโยชน์ ({helpfulCount})
          </button>
          <button className={styles.helpfulBtn} onClick={handleNotHelpfulClick} disabled={voted}>
            👎 ไม่มี ({notHelpfulCount})
          </button>
        </div>
        <button className={styles.helpfulBtn}>🚨 รายงาน</button>
      </div>
    </div>
  );
};


export default function CourseReviewsPage() {
  const params = useParams();
  const courseId = params.courseId as string; // ดึง courseId จาก URL
  const [course, setCourse] = useState<CourseData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // ดึงข้อมูลวิชา
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(); // ใช้ .single() เพราะคาดหวังผลลัพธ์เดียว

        if (courseError) {
          throw new Error('Error fetching course info: ' + courseError.message);
        }
        if (!courseData) {
            throw new Error('Course not found.');
        }
        setCourse(courseData as CourseData);

        // ดึงข้อมูลรีวิวทั้งหมดสำหรับวิชานี้
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*') // ดึงทุกคอลัมน์จากตาราง reviews
          .eq('course_id', courseId)
          .order('created_at', { ascending: false }); // เรียงตามเวลาล่าสุด

        if (reviewsError) {
          throw new Error('Error fetching reviews: ' + reviewsError.message);
        }
        
        const fetchedReviews = reviewsData as ReviewData[];
        setReviews(fetchedReviews);

        // คำนวณคะแนนเฉลี่ยและจำนวนรีวิวรวม
        if (fetchedReviews.length > 0) {
          const sumRating = fetchedReviews.reduce((sum, r) => sum + r.rating_overall, 0);
          setAverageRating(parseFloat((sumRating / fetchedReviews.length).toFixed(1)));
          setTotalReviews(fetchedReviews.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }

      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchData();
    }
  }, [courseId]); // ให้ useEffect ทำงานใหม่เมื่อ courseId เปลี่ยน

  if (loading) {
    return (
      <div className={styles.bodyBackground}>
        <div className={styles.container}>
          <p>กำลังโหลดข้อมูลวิชาและรีวิว...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.bodyBackground}>
        <div className={styles.container}>
          <p style={{ color: 'red' }}>{error}</p>
          <Link href="/" className={styles.backBtn}>← กลับไปหน้าหลัก</Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.bodyBackground}>
        <div className={styles.container}>
          <p>ไม่พบข้อมูลวิชานี้</p>
          <Link href="/" className={styles.backBtn}>← กลับไปหน้าหลัก</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bodyBackground}>
      <Head>
        <title>{course.course_name} - รีวิว</title>
        <meta name="description" content={`รีวิววิชา ${course.course_name}`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backBtn}>← กลับไปหน้าหลัก</Link>
          <div className={styles.courseInfo}>
            <div className={styles.courseCode}>{course.course_code}</div>
            <h1 className={styles.courseTitle}>{course.course_name}</h1>
            <div className={styles.courseStats}>
              <div className={styles.statItem}>
                <div className={styles.ratingDisplay}>
                  <span className={styles.stars}>{'★'.repeat(Math.floor(averageRating))}</span>
                  <span>{averageRating}/5.0</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <span>📝 {totalReviews} รีวิว</span>
              </div>
              {/* <div className={styles.statItem}>
                <span>👥 {course.students || 0} คนเรียน</span>
              </div> */}
              <div className={styles.statItem}>
                <span>⏱️ อัปเดตล่าสุด: {reviews.length > 0 ? calculateDaysAgo(reviews[0].created_at) : 'ไม่มีรีวิว'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.filters}>
            {/* Filter buttons - สามารถเพิ่ม Logic สำหรับ Filter ได้ในอนาคต */}
            <button className={`${styles.filterBtn} ${styles.active}`}>ทั้งหมด</button>
            <button className={styles.filterBtn}>ล่าสุด</button>
            <button className={styles.filterBtn}>คะแนนสูง</button>
            <button className={styles.filterBtn}>มีประโยชน์</button>
            <button className={styles.filterBtn}>ครูสอนดี</button>
            <button className={styles.filterBtn}>เนื้อหายาก</button>
            <button className={styles.filterBtn}>งานเยอะ</button>
          </div>

          <div className={styles.reviewsSection}>
            {reviews.length === 0 ? (
              <p>ยังไม่มีรีวิวสำหรับวิชานี้ คุณเป็นคนแรกที่เขียนรีวิวได้!</p>
            ) : (
              reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>

          {/* Load More button - สามารถเพิ่ม Logic สำหรับ Pagination ได้ในอนาคต */}
          {reviews.length > 0 && (
            <div className={styles.loadMore}>
              <button className={styles.loadMoreBtn}>โหลดรีวิวเพิ่มเติม</button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Review Button - สามารถเปลี่ยน Link ไปหน้าเขียนรีวิว */}
      <Link href="/review" className={styles.addReviewBtn} title="เขียนรีวิว">
        +
      </Link>
    </div>
  );
}
