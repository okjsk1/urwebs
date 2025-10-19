import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  PointerActivationConstraint
} from '@dnd-kit/core';

// 드래그 활성화 제약 조건 (실수로 드래그되는 것 방지)
const activationConstraint: PointerActivationConstraint = {
  distance: 8, // 8px 이상 이동 시 드래그 시작
};

// dnd-kit 센서 설정
export const useBoardSensors = () => {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    })
  );
};































<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
