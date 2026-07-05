import { AssessmentPhase } from './types/enums';
import { useAssessment } from './hooks/useAssessment';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Welcome } from './components/Welcome/Welcome';
import { QuestionCard } from './components/Question/QuestionCard';
import { ReportPage } from './components/Report/ReportPage';

function App() {
  const {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    report,
    isLoading,
    error,
    startAssessment,
    submitAnswer,
    restart,
  } = useAssessment();

  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f0eb 0%, #ede4d8 100%)',
      }}>
        {/* 顶部导航栏 */}
        <header style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-md)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            maxWidth: 560,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h1 style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}>
              🎵 乐理评估
            </h1>
            {phase !== AssessmentPhase.WELCOME && (
              <button
                onClick={restart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-sm)',
                  cursor: 'pointer',
                  padding: 'var(--space-xs) var(--space-sm)',
                }}
              >
                退出
              </button>
            )}
          </div>
        </header>

        {/* 主内容区 */}
        <main style={{
          paddingTop: 'var(--space-lg)',
          paddingBottom: 'var(--space-2xl)',
        }}>
          {isLoading && <LoadingSpinner text="正在准备评估..." />}

          {error && (
            <div style={{
              maxWidth: 480,
              margin: '0 auto',
              padding: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>😥</div>
              <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-sm)' }}>出了点问题</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-lg)' }}>
                {error}
              </p>
              <button
                onClick={restart}
                style={{
                  padding: '12px 32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 'var(--font-md)',
                  cursor: 'pointer',
                }}
              >
                返回首页
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {phase === AssessmentPhase.WELCOME && (
                <Welcome onStart={startAssessment} />
              )}

              {(phase === AssessmentPhase.BASELINE || phase === AssessmentPhase.ADAPTIVE) && currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  questionIndex={questionIndex}
                  totalQuestions={totalQuestions}
                  phase={phase}
                  onSubmit={submitAnswer}
                />
              )}

              {phase === AssessmentPhase.REPORT && report && (
                <ReportPage
                  report={report}
                  onRestart={restart}
                />
              )}
            </>
          )}
        </main>

        {/* 底部 */}
        <footer style={{
          textAlign: 'center',
          padding: 'var(--space-lg)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-xs)',
        }}>
          参考标准：英皇乐理（ABRSM）· 中央音乐学院音基 · 仅供粗评参考
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
