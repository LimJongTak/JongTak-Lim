import { useEffect, useState } from 'react';

/** 브라우저 confirm() 대신: 첫 클릭은 확인 상태로 바뀌고, 3초 안에 한 번 더 누르면 실행 */
export default function ConfirmButton({ onConfirm, children = '삭제', className = 'btn btn-ghost btn-sm' }: {
  onConfirm: () => void; children?: React.ReactNode; className?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button type="button" className={`${className} ${armed ? 'btn-danger' : ''}`}
      onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>
      {armed ? '한 번 더 누르면 삭제' : children}
    </button>
  );
}
