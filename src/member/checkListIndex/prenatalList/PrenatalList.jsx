import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./PrenatalList.module.css";
import { FETAL_CHECKLIST, BABY_CHECKLIST } from "./checklistData";
import UsePrenatalList from "./UsePrenatalList";

// --- CheckItem 컴포넌트 (반복되는 체크 항목) ---
const CheckItem = ({ check, onToggle }) => {
  const checkCircleClass = check.isDone
    ? styles.checkDone
    : styles.checkPending;

  return (
    <motion.div
      className={styles.checkItem}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.checkRow}>
        <button
          className={checkCircleClass}
          onClick={() => onToggle(check.id)}
        />
        <div className={styles.checkContent}>
          <b className={styles.checkTitle}>{check.title}</b>
          <div className={styles.checkDate}>{check.date}</div>
        </div>
      </div>
    </motion.div>
  );
};


// --- WeekSection 컴포넌트 ---
const WeekSection = ({ data, onToggle, isSpecialWeek }) => {
  const containerClass = isSpecialWeek
    ? styles.activeSection
    : styles.defaultSection;
  const lineDotClass = isSpecialWeek
    ? styles.activeDotLine
    : styles.defaultDotLine;

  return (
    <motion.div
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
    >
      <div className={styles.sectionInner}>
        <div className={containerClass}>
          <div className={`${styles.leftLine} ${lineDotClass}`} />
          <div className={styles.sectionContent}>
            <div className={styles.weekHeader}>
              <div className={styles.weekWrapper}>
                <b className={styles.weekTitle}>{data.week}</b>
              </div>
            </div>
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

// --- 메인 컴포넌트 ---
const PrenatalList = ({ babyData }) => {
  const initialChecklist =
    babyData?.status !== "infant" ? FETAL_CHECKLIST : BABY_CHECKLIST;
  const [checklist, setChecklist] = useState(initialChecklist);

  const handleToggleCheck = (checkId) => {
    setChecklist((prevList) =>
      prevList.map((section) => ({
        ...section,
        checks: section.checks.map((check) =>
          check.id === checkId ? { ...check, isDone: !check.isDone } : check
        ),
      }))
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.lineContainer}>
        <div className={styles.verticalLine} />
      </div>
      <div className={styles.sectionsWrapper}>
        {checklist.map((section, index) => (
          <WeekSection
            key={index}
            data={section}
            isSpecialWeek={index === 0}
            onToggle={handleToggleCheck}
          />
        ))}
      </div>
    </div>
  );
};

export default PrenatalList;
