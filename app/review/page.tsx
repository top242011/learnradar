// app/review/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from 'react';
import Head from 'next/head';
import styles from './review-form.module.css'; // นำเข้า CSS Module
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // นำเข้า Link

// Interface สำหรับข้อมูลวิชาที่แนะนำ
interface CourseSuggestion {
    id: string;
    course_code: string;
    course_name: string;
    instructor: string;
    faculty: string | null;
    credits: number | null;
}

export default function ReviewFormPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        courseCode: '',
        term: '',
        courseName: '',
        instructor: '',
        section: '',
        ratingOverall: 0,
        ratingDifficulty: 0,
        ratingTeaching: 0,
        ratingHomework: 0,
        tags: [] as string[],
        weeklyStudyHours: '',
        outsideClassHours: '',
        mainReview: '',
        tipsReview: '',
        isAnonymous: false,
    });

    const [ratingTexts, setRatingTexts] = useState({
        overall: 'ยังไม่ได้เลือก',
        difficulty: 'ง่ายมาก - ยากมาก',
        teaching: 'แย่มาก - ดีมาก',
        homework: 'น้อยมาก - เยอะมาก',
    });

    const [mainReviewCount, setMainReviewCount] = useState('0/1000');
    const [tipsReviewCount, setTipsReviewCount] = useState('0/500');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

    // State สำหรับการแนะนำวิชา
    const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);

    // ฟังก์ชันจัดการการเปลี่ยนแปลง Input ทั่วไป
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลง Input ของ Course Code พร้อม Autocomplete
    const handleCourseCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, courseCode: value }));

        console.log('Course code input:', value); // Debug: ดูค่าที่พิมพ์

        if (value.length > 1) { // เริ่มค้นหาเมื่อพิมพ์ 2 ตัวอักษรขึ้นไป
            setSuggestionLoading(true);
            setShowSuggestions(true);
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('id, course_code, course_name, instructor, faculty, credits')
                    .ilike('course_code', `%${value}%`) // ค้นหา course_code ที่มี value อยู่
                    .limit(10); // จำกัดผลลัพธ์

                if (error) {
                    console.error('Error fetching course suggestions:', error.message); // Debug: ข้อผิดพลาดจากการดึงข้อมูล
                    setSuggestions([]);
                } else {
                    console.log('Suggestions received:', data); // Debug: ข้อมูลที่ได้รับจาก Supabase
                    setSuggestions(data as CourseSuggestion[]);
                }
            } catch (err) {
                console.error('Network error fetching suggestions:', err); // Debug: ข้อผิดพลาดเครือข่าย
                setSuggestions([]);
            } finally {
                setSuggestionLoading(false);
            }
        } else {
            console.log('Input too short for suggestions.'); // Debug: พิมพ์น้อยเกินไป
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // ฟังก์ชันเมื่อผู้ใช้เลือกรายการแนะนำ
    const handleSuggestionClick = (suggestion: CourseSuggestion) => {
        setFormData(prev => ({
            ...prev,
            courseCode: suggestion.course_code,
            courseName: suggestion.course_name,
            instructor: suggestion.instructor || '', // เติมข้อมูลอาจารย์
        }));
        setSuggestions([]); // ซ่อนรายการแนะนำ
        setShowSuggestions(false);
    };

    // ฟังก์ชันจัดการ Star Rating
    const handleStarClick = (type: keyof typeof ratingTexts, value: number) => {
        setFormData(prev => ({ ...prev, [`rating${type.charAt(0).toUpperCase() + type.slice(1)}`]: value }));
        const labels: { [key: string]: string[] } = {
            overall: ['แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'],
            difficulty: ['ง่ายมาก', 'ง่าย', 'ปานกลาง', 'ยาก', 'ยากมาก'],
            teaching: ['แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'],
            homework: ['น้อยมาก', 'น้อย', 'ปานกลาง', 'เยอะ', 'เยอะมาก'],
        };
        if (labels[type]) {
            setRatingTexts(prev => ({ ...prev, [type]: labels[type][value - 1] }));
        }
    };

    // ฟังก์ชันจัดการ Tag Checkbox
    const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newTags = checked
                ? [...prev.tags, value]
                : prev.tags.filter(tag => tag !== value);
            return { ...prev, tags: newTags };
        });
    };

    // Effect สำหรับ Character Counter
    useEffect(() => {
        setMainReviewCount(`${formData.mainReview.length}/1000`);
        setTipsReviewCount(`${formData.tipsReview.length}/500`);
    }, [formData.mainReview, formData.tipsReview]);

    // ฟังก์ชันจัดการการส่งฟอร์ม
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionMessage(null);

        try {
            let courseId: string | null = null;
            
            // ค้นหาคอร์สที่มีอยู่
            const { data: existingCourses, error: courseFetchError } = await supabase
                .from('courses')
                .select('id')
                .eq('course_code', formData.courseCode)
                .eq('course_name', formData.courseName)
                .limit(1);

            if (courseFetchError) {
                throw new Error('Error finding course: ' + courseFetchError.message);
            }

            if (existingCourses && existingCourses.length > 0) {
                courseId = existingCourses[0].id;
            } else {
                // ถ้าไม่พบ course ให้สร้าง course ใหม่
                const { data: newCourse, error: newCourseError } = await supabase
                    .from('courses')
                    .insert([
                        {
                            course_code: formData.courseCode,
                            course_name: formData.courseName,
                            instructor: formData.instructor,
                            faculty: 'ไม่ระบุ',
                            credits: 0,
                        }
                    ])
                    .select('id');

                if (newCourseError) {
                    throw new Error('Error creating new course: ' + newCourseError.message);
                }
                courseId = newCourse ? newCourse[0].id : null;
            }

            if (!courseId) {
                throw new Error('Could not determine course ID.');
            }

            // 2. เตรียมข้อมูลสำหรับ insert ลงตาราง reviews
            const reviewData = {
                course_id: courseId,
                term: formData.term,
                section_number: formData.section || null,
                rating_overall: formData.ratingOverall,
                rating_difficulty: formData.ratingDifficulty || null,
                rating_teaching: formData.ratingTeaching || null,
                rating_homework: formData.ratingHomework || null,
                tags: formData.tags.length > 0 ? formData.tags : null,
                content: formData.mainReview,
                tips_review_content: formData.tipsReview || null,
                is_anonymous: formData.isAnonymous,
            };

            // 3. Insert ข้อมูลลงตาราง reviews
            const { error: insertError } = await supabase
                .from('reviews')
                .insert([reviewData]);

            if (insertError) {
                throw new Error('Error submitting review: ' + insertError.message);
            }

            setSubmissionMessage('ส่งรีวิวสำเร็จแล้ว!');
            alert('ส่งรีวิวสำเร็จแล้ว!');

            // รีเซ็ตฟอร์มหลังจากส่งสำเร็จ
            setFormData({
                courseCode: '',
                term: '',
                courseName: '',
                instructor: '',
                section: '',
                ratingOverall: 0,
                ratingDifficulty: 0,
                ratingTeaching: 0,
                ratingHomework: 0,
                tags: [],
                weeklyStudyHours: '',
                outsideClassHours: '',
                mainReview: '',
                tipsReview: '',
                isAnonymous: false,
            });
            setRatingTexts({
                overall: 'ยังไม่ได้เลือก',
                difficulty: 'ง่ายมาก - ยากมาก',
                teaching: 'แย่มาก - ดีมาก',
                homework: 'น้อยมาก - เยอะมาก',
            });

            router.push('/');

        } catch (error: unknown) {
            console.error('Submission failed:', error);
            let errorMessage = 'เกิดข้อผิดพลาดในการส่งรีวิว';
            if (error instanceof Error) {
                errorMessage += ': ' + error.message;
            }
            setSubmissionMessage(errorMessage);
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.bodyBackground}>
            <Head>
                <title>เขียนรีวิววิชาเรียน - Learn Radar</title>
                <meta name="description" content="เขียนรีวิววิชาเรียนสำหรับนักศึกษา" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.backButtonContainer}>
                        <Link href="/" className={styles.backBtn}>← กลับไปหน้าหลัก</Link>
                    </div>
                    <h1>✍️ เขียนรีวิววิชาเรียน</h1>
                    <p>แบ่งปันประสบการณ์การเรียนให้เพื่อนนักศึกษา</p>
                </div>

                <form className={styles.reviewForm} onSubmit={handleSubmit}>
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>📚 ข้อมูลวิชาเรียน</h2>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>รหัสวิชา <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    name="courseCode"
                                    className={styles.formInput}
                                    placeholder="เช่น CS101, MATH201"
                                    value={formData.courseCode}
                                    onChange={handleCourseCodeChange}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    required
                                />
                                {showSuggestions && (suggestions.length > 0 || suggestionLoading || formData.courseCode.length > 1) && (
                                    <ul className={styles.suggestionsList}>
                                        {suggestionLoading && <li className={styles.suggestionLoading}>กำลังค้นหา...</li>}
                                        {!suggestionLoading && suggestions.map(suggestion => (
                                            <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                                <strong>{suggestion.course_code}</strong> - {suggestion.course_name} ({suggestion.instructor})
                                            </li>
                                        ))}
                                        {!suggestionLoading && suggestions.length === 0 && formData.courseCode.length > 1 && (
                                            <li className={styles.noSuggestions}>ไม่พบวิชา</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>ปีการศึกษา/เทอม <span className={styles.required}>*</span></label>
                                <select name="term" className={styles.formSelect} value={formData.term} onChange={handleInputChange} required>
                                    <option value="">เลือกเทอม</option>
                                    <option value="2567/1">2567/1</option>
                                    <option value="2566/2">2566/2</option>
                                    <option value="2566/1">2566/1</option>
                                    <option value="2565/2">2565/2</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>ชื่อวิชา <span className={styles.required}>*</span></label>
                            <input type="text" name="courseName" className={styles.formInput} placeholder="เช่น Introduction to Computer Science" value={formData.courseName} onChange={handleInputChange} required />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>อาจารย์ผู้สอน <span className={styles.required}>*</span></label>
                                <input type="text" name="instructor" className={styles.formInput} placeholder="เช่น อ.ดร.สมชาย ใจดี" value={formData.instructor} onChange={handleInputChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>เซคชั่น</label>
                                <input type="text" name="section" className={styles.formInput} placeholder="เช่น 01, 02, 03" value={formData.section} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>⭐ การให้คะแนน</h2>

                        <div className={styles.ratingSection}>
                            <div className={styles.ratingGroup}>
                                <label className={styles.ratingLabel}>คะแนนรวม <span className={styles.required}>*</span></label>
                                <div className={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <span
                                            key={`overall-${value}`}
                                            className={`${styles.star} ${value <= formData.ratingOverall ? styles.active : ''}`}
                                            onClick={() => handleStarClick('overall', value)}
                                            onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#FFC107'; });
                                                stars.forEach((s, i) => {
                                                    if (i < value) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                            onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#ddd'; });
                                                stars.forEach((s, i) => {
                                                    if (i < formData.ratingOverall) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className={styles.ratingText} id="overallText">{ratingTexts.overall}</span>
                                </div>
                            </div>

                            <div className={styles.ratingGroup}>
                                <label className={styles.ratingLabel}>ความยากง่าย</label>
                                <div className={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <span
                                            key={`difficulty-${value}`}
                                            className={`${styles.star} ${value <= formData.ratingDifficulty ? styles.active : ''}`}
                                            onClick={() => handleStarClick('difficulty', value)}
                                            onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#FFC107'; });
                                                stars.forEach((s, i) => {
                                                    if (i < value) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                            onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#ddd'; });
                                                stars.forEach((s, i) => {
                                                    if (i < formData.ratingDifficulty) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className={styles.ratingText} id="difficultyText">{ratingTexts.difficulty}</span>
                                </div>
                            </div>

                            <div className={styles.ratingGroup}>
                                <label className={styles.ratingLabel}>คุณภาพการสอน</label>
                                <div className={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <span
                                            key={`teaching-${value}`}
                                            className={`${styles.star} ${value <= formData.ratingTeaching ? styles.active : ''}`}
                                            onClick={() => handleStarClick('teaching', value)}
                                            onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#FFC107'; });
                                                stars.forEach((s, i) => {
                                                    if (i < value) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                            onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#ddd'; });
                                                stars.forEach((s, i) => {
                                                    if (i < formData.ratingTeaching) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className={styles.ratingText} id="teachingText">{ratingTexts.teaching}</span>
                                </div>
                            </div>

                            <div className={styles.ratingGroup}>
                                <label className={styles.ratingLabel}>ปริมาณการบ้าน</label>
                                <div className={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <span
                                            key={`homework-${value}`}
                                            className={`${styles.star} ${value <= formData.ratingHomework ? styles.active : ''}`}
                                            onClick={() => handleStarClick('homework', value)}
                                            onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#FFC107'; });
                                                stars.forEach((s, i) => {
                                                    if (i < value) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                            onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                                                const stars = (e.currentTarget.parentNode as HTMLElement).querySelectorAll(`.${styles.star}`);
                                                stars.forEach((s) => { (s as HTMLElement).style.color = '#ddd'; });
                                                stars.forEach((s, i) => {
                                                    if (i < formData.ratingHomework) { (s as HTMLElement).style.color = '#FFC107'; } else { (s as HTMLElement).style.color = '#ddd'; }
                                                });
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className={styles.ratingText} id="homeworkText">{ratingTexts.homework}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>🏷️ ลักษณะของวิชา</h2>
                        <div className={styles.tagsSection}>
                            <p>เลือกคำที่บรรยายวิชานี้ได้ดีที่สุด (เลือกได้หลายข้อ)</p>
                            <div className={styles.tagsGrid}>
                                {['มีการบ้านเยอะ', 'ใช้ความคิดเยอะ', 'ต้องท่องจำ', 'มีงานกลุ่ม', 'ใช้คอมพิวเตอร์', 'ปฏิบัติจริง', 'ง่ายผ่าน', 'ท้าทาย'].map(tag => (
                                    <div key={tag}>
                                        <input
                                            type="checkbox"
                                            id={`tag-${tag}`}
                                            name="tags"
                                            value={tag}
                                            className={styles.tagCheckbox}
                                            checked={formData.tags.includes(tag)}
                                            onChange={handleTagChange}
                                        />
                                        <label htmlFor={`tag-${tag}`} className={styles.tagLabel}>
                                            {tag === 'มีการบ้านเยอะ' ? '📝 ' + tag :
                                             tag === 'ใช้ความคิดเยอะ' ? '🧠 ' + tag :
                                             tag === 'ต้องท่องจำ' ? '📚 ' + tag :
                                             tag === 'มีงานกลุ่ม' ? '👥 ' + tag :
                                             tag === 'ใช้คอมพิวเตอร์' ? '💻 ' + tag :
                                             tag === 'ปฏิบัติจริง' ? '🎯 ' + tag :
                                             tag === 'ง่ายผ่าน' ? '😴 ' + tag :
                                             tag === 'ท้าทาย' ? '🔥 ' + tag : tag
                                            }
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>💭 รีวิวของคุณ</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>รีวิวโดยรวม <span className={styles.required}>*</span></label>
                            <textarea
                                name="mainReview"
                                className={styles.formTextArea}
                                placeholder="เล่าประสบการณ์การเรียนวิชานี้ เช่น อาจารย์สอนอย่างไร เนื้อหายากแค่ไหน สิ่งที่ชอบ/ไม่ชอบ..."
                                required
                                maxLength={1000}
                                value={formData.mainReview}
                                onChange={handleInputChange}
                            ></textarea>
                            <div className={`${styles.characterCount} ${formData.mainReview.length > 900 ? styles.warning : ''} ${formData.mainReview.length >= 1000 ? styles.error : ''}`}>
                                {mainReviewCount}
                            </div>
                        </div>

                        <div className={styles.tipsSection}>
                            <h3 className={styles.sectionTitle}>💡 เคล็ดลับสำหรับผู้ที่จะมาเรียนวิชานี้</h3>
                            <textarea
                                name="tipsReview"
                                className={styles.formTextArea}
                                placeholder="แนะนำวิธีเรียน การเตรียมตัว สิ่งที่ควรรู้ก่อนเรียน หรือข้อควรระวัง..."
                                maxLength={500}
                                value={formData.tipsReview}
                                onChange={handleInputChange}
                            ></textarea>
                            <div className={`${styles.characterCount} ${formData.tipsReview.length > 450 ? styles.warning : ''} ${formData.tipsReview.length >= 500 ? styles.error : ''}`}>
                                {tipsReviewCount}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>🔒 ความเป็นส่วนตัว</h2>
                        <div className={styles.anonymousToggle}>
                            <div
                                className={`${styles.toggleSwitch} ${formData.isAnonymous ? styles.active : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                            ></div>
                            <div>
                                <strong>ส่งรีวิวแบบไม่ระบุชื่อ</strong>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.2rem' }}>
                                    เมื่อเปิดใช้งาน รีวิวของคุณจะแสดงเป็น &quot;นักศึกษาคนหนึ่ง&quot; แทนชื่อจริง
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formButtons}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting}>
                            {isSubmitting ? 'กำลังส่ง...' : '📝 ส่งรีวิว'}
                        </button>
                    </div>

                    {submissionMessage && (
                        <div className={styles.submissionMessage} style={{ color: submissionMessage.includes('สำเร็จ') ? 'green' : 'red' }}>
                            {submissionMessage}
                        </div>
                    )}
                </form>
            </div>

            <div className={styles.floatingHelp} title="ช่วยเหลือ">
                ❓
            </div>
        </div>
    );
}
