import { useState } from "react";
import useAuthStore from "../../store/useStore";

function useChooseType(inputBlocks, setInputBlocks) {
    // 애기 시퀀스 바꿀 준비
    const getbabySeq = useAuthStore((state) => state.getbabySeq);

    // 데이터 보낼 준비 
    const data = { name: "", gender: "", image_name: "", birthDate: "" };
    // 유효성
    const nickNameRegex = /^[가-힣0-9]{2,6}$/ // 닉네임 한글 2~6글자
    
    // 날짜 선택 기점 잡아주기
    const today = new Date();
    // 오늘 날짜
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // 어제 날짜
    const yesterdayDate = new Date(today); // 오늘 날짜 복사
    yesterdayDate.setDate(today.getDate() - 1); // 하루를 빼서 어제 날짜로 설정

    const yYear = yesterdayDate.getFullYear();
    const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterdayString = `${yYear}-${yMonth}-${yDay}`;

    // 핸들러 준비
    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setInputBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks[index] = {
                ...newBlocks[index],
                [name]: value,
            };
            return newBlocks;
        });
    }

    // 완료 버튼 클릭시
    const handleComplete = (e) => {
        for (const obj of data) {
            const nameValue = obj.name;
            const isValid = nickNameRegex.test(nameValue);

            if (!isValid) { return; }
        }
    }
    // 엔터
    const handleLoginKeyUp = (e) => {
        if (e.key === 'Enter') {
            handleComplete();
        }
    }

    return {
        data
    }
}
export default useChooseType;