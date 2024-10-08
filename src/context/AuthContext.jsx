import { createContext, useContext, useEffect, useState } from "react";
import { onUserStateChange } from "../api/firebase";
import { login, logout } from '../api/firebase';

// 컨텍스트 생성
const authContext = createContext();

// 로컬 스토리지에 최근에 본 상품 목록 저장
// recentlyViewed: 최근에 본 모든 상품들 배열
const setRecentlyViewedToLocalStorage = (recentlyViewed) => {
    // 로컬 스토리지에 최근에 본 상품 목록을 -> "recentlyViewed"키로 -> json 형식으로 저장
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    // 로컬 스토리지는 문자열만 저장할 수 있기에 -> 자바스크립트 객체를 json 문자열로 변환 -> 저장
};


// 로컬 스토리지에서 최근에 본 상품 목록 가져오기
const getRecentlyViewedFromLocalStorage = () => {
    // 로컬 스토리지에서 "recentlyViewed" 키로 저장된 데이터 가져옴 
    const recentlyViewedJson = localStorage.getItem("recentlyViewed");
    // 가져온 데이터가 있으면 json으로 파싱 (json -> 자바스크립트 객체 = 자바스크립트에서 사용하도록 변환)
    // 없으면 빈 배열 반환
    return recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];
};




export function AuthContextProvider({ children }) {

    const [user, setUser] = useState();
    const [searchResults, setSearchResults] = useState([]);
    // 최근 본 상품 목록 -> "recentlyViewed"키로 저장된 데이터
    const [recentlyViewed, setRecentlyViewed] = useState(getRecentlyViewedFromLocalStorage());
    

    // 사용자 로그인 상태 감지 (로그인 여부 확인)
    useEffect(() => {
        // onUserStateChange: 네트워크로부터 현재 사용자 정보(user)를 자동으로 가져옴
        onUserStateChange((user) => {
            console.log(user);
            // 로그인한 사용자 정보 상태 저장
            setUser(user);
        });
    }, []);



    // 상품 클릭 시 로컬 스토리지에 저장
    // product: 유저가 클릭한 상품
    const handleProductClick = (product) => {
        
        // 최근 본 상품이 목록에 있는 지 확인 (findIndex)
        const isAlreadyViewedIndex = recentlyViewed.findIndex((item) => item.id === product.id);

        // 최근 본 상품이 목록에 있으면
        if (isAlreadyViewedIndex !== -1) {
            // 최근 본 상품 목록 상태 복사 (복사본을 수정하고 원본 상태에 반영)
            const updatedRecentlyViewed = [...recentlyViewed];
            // 기존 위치에서 상품을 목록에서 제거 (splice)
            updatedRecentlyViewed.splice(isAlreadyViewedIndex, 1);
            // 클릭한 상품을 목록 맨 앞에 다시 추가 (unshift)
            updatedRecentlyViewed.unshift(product);
            // '로컬 스토리지(setRecentlyViewedToLocalStorage)'에 순서 변경된 최근 본 상품 목록(updatedRecentlyViewed) 저장
            setRecentlyViewedToLocalStorage(updatedRecentlyViewed); 
            // '최근 본 상품 목록 상태(setRecentlyViewed)'를 순서 변경된 최근 본 상품 목록(updatedRecentlyViewed)으로 갱신
            setRecentlyViewed(updatedRecentlyViewed);
        // 이미 본 상품 아니면    
        } else {
            // 클릭한 상품(product)을 목록 맨 앞에 추가 (총 5개 아이템 표시)
            const updatedRecentlyViewed = [
                product, 
                ...recentlyViewed.slice(0, 4)
            ];
            // '로컬 스토리지'에 새로운 최근 본 상품 목록(updatedRecentlyViewed) 저장
            setRecentlyViewedToLocalStorage(updatedRecentlyViewed);
            // '최근 본 상품 목록 상태' 새로운 최근 본 상품 목록(updatedRecentlyViewed)으로 갱신
            setRecentlyViewed(updatedRecentlyViewed);
        }
    };




    // 컨텍스트 값 정의
    const authContextValue = {
        // 현재 사용자 정보
        user: user, 
        login: login,
        logout: logout,
        uid: user && user.uid,
        // 검색 결과
        searchResults: searchResults,
        // 검색 결과 업데이트
        setSearchResults: setSearchResults,
        recentlyViewed: recentlyViewed,
        setRecentlyViewed, setRecentlyViewed,
        handleProductClick: handleProductClick,
        setRecentlyViewedToLocalStorage: setRecentlyViewedToLocalStorage,
        getRecentlyViewedFromLocalStorage: getRecentlyViewedFromLocalStorage,
    };

    
    return (
        <authContext.Provider value={authContextValue}>
            {children}
        </authContext.Provider>
    );
}



// 커스텀 훅 (상태 재사용 함수)
export function useAuthContext() {
    return useContext(authContext);
}