import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { fetchCourse } from '../api/data-service';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id]);

  const loadCourse = async (courseId: string) => {
    setLoading(true);
    const data = await fetchCourse(courseId);
    setCourse(data);
    
    if (user && data) {
      const { data: interaction } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'complete')
        .eq('course_set_id', data.courseSetId)
        .maybeSingle();
      setCompleted(!!interaction);
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsCompleting(true);
    try {
      if (completed) {
        await supabase
          .from('user_interactions')
          .delete()
          .eq('user_id', user!.id)
          .eq('type', 'complete')
          .eq('course_set_id', course.courseSetId);
      } else {
        await supabase
          .from('user_interactions')
          .insert({
            user_id: user!.id,
            type: 'complete',
            course_set_id: course.courseSetId
          });
      }
      setCompleted(!completed);
    } catch (err) {
      console.error('Error updating completion:', err);
    }
    setIsCompleting(false);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'installation': return '📦 安装指南';
      case 'basic': return '🔧 基础技能';
      case 'advanced': return '🚀 进阶技能';
      default: return '📚 课程';
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return <p className="empty-content">暂无课程内容，请等待 AI 生成...</p>;
    
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
      if (line.startsWith('```')) {
        const isClosing = line.trim() === '```';
        if (isClosing) return <div key={i} className="code-end" />;
        return null;
      }
      if (line.match(/^```\w+/)) return <pre key={i}><code>{line.replace(/```\w*/, '')}</code></pre>;
      if (line.trim() === '') return <br key={i} />;
      if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
      if (line.match(/^\d+\. /)) return <li key={i}>{line.replace(/^\d+\. /, '')}</li>;
      if (line.startsWith('| ')) return <div key={i} className="table-row">{line}</div>;
      return <p key={i}>{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="course-detail">
        <Navbar />
        <main className="course-detail-main">
          <div className="container">
            <div className="loading-state">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail">
        <Navbar />
        <SEO title="课程未找到" />
        <main className="course-detail-main">
          <div className="container">
            <div className="error-state">
              <h2>❌ 课程未找到</h2>
              <p>该课程可能已被删除或暂时不可用。</p>
              <Link to="/course-sets" className="btn btn-primary">返回课程集</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <SEO
        title={course.title}
        description={course.description}
        canonicalUrl={`/course/${id}`}
        keywords={`OpenClaw 教程, ${course.title}, Claw 学习`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.description,
          provider: {
            '@type': 'Organization',
            name: 'ClawSchool',
            url: 'https://clawschool-five.vercel.app'
          },
          educationalLevel: course.category === 'advanced' ? '高级' : course.category === 'basic' ? '进阶' : '入门'
        }}
      />
      <Navbar />
      
      <main className="course-detail-main">
        <div className="container">
          <Link to="/course-sets" className="back-link">← 返回课程集</Link>
          
          <div className="course-detail-header">
            <div>
              <span className="course-tag">
                {getCategoryLabel(course.category)}
              </span>
              {course.courseSet && (
                <Link to="/course-sets" className="course-set-link">
                  {course.courseSet.icon} {course.courseSet.title}
                </Link>
              )}
              <h1>{course.title}</h1>
              <p className="text-gray">{course.description}</p>
              {course.duration && (
                <span className="course-duration">⏱️ {course.duration}</span>
              )}
            </div>
            <button 
              className={`btn ${completed ? 'btn-success' : 'btn-primary'}`}
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {completed ? '✅ 已完成' : '✓ 标记完成'}
            </button>
          </div>
          
          <div className="course-content">
            <article className="markdown-content">
              {renderMarkdown(course.content)}
            </article>
          </div>
          
          <div className="course-nav">
            <Link to="/course-sets" className="btn btn-secondary">
              ← 返回课程集
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
