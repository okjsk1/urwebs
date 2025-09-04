import * as React from "react"; // React 라이브러리를 모두 가져옵니다.

import { cn } from "./utils"; // Tailwind CSS 클래스를 결합하는 유틸리티 함수를 가져옵니다.

function Card({ className, ...props }: React.ComponentProps<"div">) { // Card 컴포넌트를 정의합니다. 모든 div 속성을 받습니다.
  return (
    <div
      data-slot="card" // 테스트 및 스타일링을 위한 데이터 속성입니다.
      className={cn( // cn 함수를 사용해 기본 스타일과 추가 클래스를 결합합니다.
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props} // 전달받은 모든 props(예: onClick, id 등)를 적용합니다.
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) { // CardHeader 컴포넌트를 정의합니다.
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) { // CardTitle 컴포넌트를 정의합니다.
  return (
    <h4 // 제목을 나타내는 h4 태그를 사용합니다.
      data-slot="card-title"
      className={cn("leading-none", className)} // 줄 간격을 없애는 스타일을 적용합니다.
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) { // CardDescription 컴포넌트를 정의합니다.
  return (
    <p // 설명을 나타내는 p 태그를 사용합니다.
      data-slot="card-description"
      className={cn("text-muted-foreground", className)} // 텍스트 색상을 보조 텍스트용으로 설정합니다.
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) { // CardAction 컴포넌트를 정의합니다.
  return (
    <div
      data-slot="card-action"
      className={cn( // 그리드 레이아웃에서 특정 위치에 배치되도록 스타일을 지정합니다.
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) { // CardContent 컴포넌트를 정의합니다.
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)} // 좌우 패딩을 적용하고, 마지막 요소인 경우 아래쪽 패딩을 추가합니다.
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) { // CardFooter 컴포넌트를 정의합니다.
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)} // flexbox를 사용해 내부 요소를 중앙 정렬하고 패딩을 적용합니다.
      {...props}
    />
  );
}

export { // 외부에서 이 컴포넌트들을 사용할 수 있도록 내보냅니다.
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};