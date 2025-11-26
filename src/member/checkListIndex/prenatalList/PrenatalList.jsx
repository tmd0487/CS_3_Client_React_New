import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./PrenatalList.module.css";

const FETAL_CHECKLIST = [
  {
    id: 1,
    week: "12주차",
    checks: [
      { id: 1, title: "첫 번째 검사", date: "2025-11-25" },
      { id: 2, title: "예약", date: "" },
    ],
  },
];

const BABY_CHECKLIST = [
  {
    id: 1,
    week: "1개월",
    checks: [{ id: 1, title: "첫 번째 예방접종", date: "" }],
  },
];

// --- CheckItem: 개별 체크리스트 항목 컴포넌트 ---
const CheckItem = ({ check, onToggle }) => {
  // 완료 상태에 따라 다른 CSS 클래스 적용
  const checkCircleClass = check.isDone
    ? styles.checkDone // 완료된 상태 (색상 채워짐)
    : styles.checkPending; // 미완료 상태 (테두리만 있음)

  return (
    <motion.div
      className={styles.checkItem}
      // Framer Motion: 항목 로드 시 왼쪽에서 부드럽게 나타나는 애니메이션 효과 적용
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.checkRow}>
        <button
          className={checkCircleClass}
          onClick={() => onToggle(check)} // check 전체 객체 전달
        />
        <div className={styles.checkContent}>
          <b className={styles.checkTitle}>{check.title}</b>
          <div className={styles.checkDate}>{check.date}</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- WeekSection: 주차/월령별 섹션 컨테이너 컴포넌트 ---
const WeekSection = ({ data, onToggle, isSpecialWeek }) => {
  // isSpecialWeek (가장 최근/현재 주차) 여부에 따라 스타일 클래스 결정
  const containerClass = isSpecialWeek
    ? styles.activeSection // 활성 섹션: 노란색 배경 및 테두리로 강조
    : styles.defaultSection; // 일반 섹션
  const lineDotClass = isSpecialWeek
    ? styles.activeDotLine // 활성 섹션 라인 도트
    : styles.defaultDotLine; // 일반 섹션 라인 도트

  return (
    <motion.div
      className={styles.section}
      // Framer Motion: 섹션 로드 시 아래에서 부드럽게 나타나는 애니메이션
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
    >
      <div className={styles.sectionInner}>
        <div className={containerClass}>
          {/* 주차 라인의 도트와 연결선 */}
          <div className={`${styles.leftLine} ${lineDotClass}`} />
          <div className={styles.sectionContent}>
            {/* 주차/월령 타이틀 (노란색 배경) */}
            <div className={styles.weekHeader}>
              <div className={styles.weekWrapper}>
                <b className={styles.weekTitle}>{data.week}</b>
              </div>
            </div>

            {/* CheckItem 목록 렌더링 */}
            <div className={styles.checkList}>
              {data.checks.map((check) => (
                <CheckItem key={check.id} check={check} onToggle={onToggle} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- PrenatalList 메인 컴포넌트: 체크리스트와 모달을 관리 ---
const PrenatalList = ({ babyData }) => {
  const isInfant = babyData?.status === "infant";

  // 모달 표시 여부를 관리하는 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 체크리스트 데이터 상태
  const [checklist, setChecklist] = useState([]);
  // 모달용 체크 버튼
  const [selectedCheck, setSelectedCheck] = useState(null);

  // 아기 상태(태아/영아)에 따라 초기 체크리스트 데이터를 결정
  const checklistInitial = useMemo(() => {
    return isInfant ? BABY_CHECKLIST : FETAL_CHECKLIST;
  }, [isInfant]);

  // babyData나 checklistInitial이 변경될 때 체크리스트를 초기화
  useEffect(() => {
    if (!babyData) return;

    // 모든 항목의 isDone 상태를 false로 초기화
    setChecklist(
      checklistInitial.map((section) => ({
        ...section,
        checks: section.checks.map((check) => ({ ...check, isDone: false })),
      }))
    );
  }, [babyData, checklistInitial]);

  // 모달을 닫는 함수
  const handleCloseModal = () => setIsModalOpen(false);

  // 체크 버튼 클릭 핸들러
  const handleToggleCheck = (check) => {
    if (check.title.includes("예약")) {
      // 예약이면 모달 열기
      setSelectedCheck(check);
      setIsModalOpen(true);
      return;
    }

    // 키워드 미포함 시: 해당 항목의 isDone 상태를 토글
    setChecklist((prev) =>
      prev.map((section) => ({
        ...section,
        checks: section.checks.map((c) =>
          c.id === check.id ? { ...c, isDone: !c.isDone } : c
        ),
      }))
    );
  };

  if (!babyData) return null;

  return (
    <>
      {/* 체크리스트 메인 컨테이너 */}
      <div className={styles.container}>
        {/* 타임라인 배경선 컨테이너 */}
        <div className={styles.lineContainer}>
          <div className={styles.verticalLine} />
        </div>

        {/* 주차 섹션 목록을 렌더링 */}
        <div className={styles.sectionsWrapper}>
          {checklist.map((section, index) => (
            <WeekSection
              key={section.id}
              data={section}
              isSpecialWeek={index === 0} // 첫 번째 섹션을 강조
              onToggle={handleToggleCheck}
            />
          ))}
        </div>
      </div>

      {/* --- 검진 예약 모달 팝업 --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.innerWrapper}>
            <div className={styles.modalContent}>
              <div className={styles.headerSection}>
                <h1 className={styles.title}>{selectedCheck.title}</h1>
                <p className={styles.subtitle}>예약 날짜를 작성해주세요</p>
              </div>

              <div className={styles.formSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>예약 날짜</label>
                  <div className={styles.row}>
                    <input type="date" className={styles.inputBox} />
                    <button className={styles.confirmBtn}>예약 확인</button>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button className={styles.backBtn} onClick={handleCloseModal}>
                    뒤로가기
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={handleCloseModal}
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrenatalList;
