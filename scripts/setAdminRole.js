// Firebase Admin SDK를 사용하여 관리자 역할 설정
// 이 스크립트는 Firebase Console의 Cloud Shell에서 실행하세요

const admin = require('firebase-admin');

// Firebase Admin SDK 초기화 (이미 초기화되어 있다면 생략)
// admin.initializeApp();

async function setAdminRole(email) {
  try {
    // 이메일로 사용자 찾기
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('사용자 찾음:', userRecord.uid, userRecord.email);
    
    // Custom Claims 설정
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles: ['admin']
    });
    
    console.log('✅ 관리자 역할이 성공적으로 설정되었습니다!');
    console.log('이메일:', email);
    console.log('UID:', userRecord.uid);
    console.log('설정된 역할:', ['admin']);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// okjsk1@gmail.com에 관리자 역할 설정
setAdminRole('okjsk1@gmail.com');
