import React, { useEffect, useState } from "react";
import styles from "./ChartInput.module.css";
import { submitChartData } from "./UseChartInput"; // JS 분
import useAuthStore from "../../../store/useStore";

const ChartInput = ({ menuList, activeMenu, currentWeek, inputs, setInputs, actualData,fetchActualData, measureTypes }) => {
  const activeItem = menuList[activeMenu];
  const [isEditing, setIsEditing] = useState(false);

  const hasData = actualData && Object.keys(actualData).length > 0;
  const isDisabled = hasData && !isEditing;
  console.log("실제 데이터" + actualData.EFW);
  const [date, setDate] = useState("");

  const { id, babySeq } = useAuthStore();
  const REQUIRED_KEYS = [
    "몸무게",
    "머리직경",
    "머리둘레",
    "복부둘레",
    "허벅지 길이"
];



  const handleChange = (key, value) => {
    console.log("응애", key, ":", value)
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {


    //날짜 검사
    if (!date || date.trim() === "") {
      alert("날짜를 입력해주세요.");
      return;
    }

    const invalidInput = REQUIRED_KEYS.some((key) => {
        const value = inputs[key];
        
        // 필수 키가 inputs에 없거나 (undefined), 값이 없거나, 숫자가 아니거나, 0 이하인 경우
        return (
            value === undefined ||             // 👈 inputs에 키 자체가 없는 경우 (허벅지 둘레 미입력 시)
            value === null || 
            value === "" ||
            isNaN(Number(value)) ||
            Number(value) <= 0
        );
    });

    if (invalidInput) {
        alert("모든 필수 항목(" + REQUIRED_KEYS.join(', ') + ")을 올바르게 입력해주세요.");
        return;
    }

    // //미입력 필드 검사
    // const hasEmptyField = Object.values(inputs).some(
    //   (value) => value === undefined || value === null || value === ""
    // );

    // if (hasEmptyField) {
    //   alert("입력되지 않은 항목이 있습니다.");
    //   return;
    // }

    //서버 전송
    const res = await submitChartData({ inputs, date, babySeq, id, measureTypes });
    console.log("submitChartData 결과:", res);

    
    if (res?.data) {
      console.log("이거 실행 되나요?");
      await fetchActualData(); 
      setIsEditing(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancelOrUpdate = () => setIsEditing(false);

  const shouldRenderSingleInput = activeItem !== "성장";
  const isWeightInput = activeItem === "몸무게";
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {


    if (actualData?.measure_date) {
      let formattedDate;

      // measure_date가 Date 혹은 Timestamp 객체일 때
      if (actualData.measure_date instanceof Date) {
        formattedDate = actualData.measure_date.toISOString().split("T")[0];
      } else if (typeof actualData.measure_date === "string") {
        // 이미 문자열이면 그냥 사용, 혹은 YYYY-MM-DD 형태인지 체크
        formattedDate = actualData.measure_date.split("T")[0]; // "2025-11-27T..." → "2025-11-27"
      } else {
        // 그 외 타입이면 강제로 빈 문자열
        formattedDate = "";
      }

      setDate(formattedDate);

      if (actualData && Object.keys(actualData).length > 0) {
    setIsEditing(false); // 완료 후 자동으로 수정 버튼으로 바뀌게
  }

    }
  }, [actualData]);

  return (
    <div className={styles.sidePanel}>
      <div className={styles.panelHeader}>{activeItem}</div>

      <div className={styles.panelContent}>
        <label className={styles.label}>날짜</label>
        <input
          className={styles.input}
          type="date"
          placeholder="날짜"
          value={date}
          min={todayStr}
          max={todayStr}
          disabled={isDisabled}
          onChange={(e) => setDate(e.target.value)}
        />

        {activeItem === "성장" && (
          <div className={styles.allInputGroup}>
            {menuList.slice(1).map((item) => (
              <div key={item} className={styles.inputGroup}>
                <label className={styles.label}>{item}</label>
                {item === "몸무게" ? (
                  <div className={styles.inputWithUnit}>
                    <input
                      className={styles.input}
                      type="number"
                      // value={actualData[item] ?? ""}
                      value={inputs[item] ?? ""}
                      disabled={isDisabled}
                      onChange={(e) => handleChange(item, e.target.value)}
                      placeholder={item}
                    />
                    <span className={styles.unit}>kg</span> 
                  </div>// 잠시 kg -> g으로 바꿔서 사용 >> 나중에 다바꿔야해서 편의상 g 사용해야할거같음
                ) : (
                  <input
                    className={styles.input}
                    type="number"
                    // value={actualData[item] ?? ""}
                    value={inputs[item] ?? ""}
                    disabled={isDisabled}
                    onChange={(e) => handleChange(item, e.target.value)}
                    placeholder={item}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {shouldRenderSingleInput && activeItem !== "성장" && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>{activeItem}</label>
            {isWeightInput ? (
              <div className={styles.inputWithUnit}>
                <input
                  className={styles.input}
                  type="number"
                  value={inputs[activeItem] ?? ""}
                  disabled={isDisabled}
                  onChange={(e) => handleChange(activeItem, e.target.value)}
                  placeholder={activeItem}
                />
                <span className={styles.unit}>kg</span>
              </div>
            ) : (
              <input
                className={styles.input}
                type="number"
                value={inputs[activeItem] ?? ""}
                disabled={isDisabled}
                onChange={(e) => handleChange(activeItem, e.target.value)}
                placeholder={activeItem}
              />
            )}
          </div>
        )}
      </div>

      <div className={styles.buttonRow}>
        {!hasData && (
          <button className={styles.submitBtn} onClick={handleSubmit}>
            완료
          </button>
        )}
        {hasData && isEditing && (
          <>
            <button className={styles.cancelBtn} onClick={handleCancelOrUpdate}>
              취소
            </button>
            <button className={styles.submitBtn} onClick={handleCancelOrUpdate}>
              수정완료
            </button>
          </>
        )}
        {hasData && !isEditing && (
          <button className={styles.submitBtn} onClick={handleEdit}>
            수정
          </button>
        )}
      </div>
    </div>
  );
};

export default ChartInput;
