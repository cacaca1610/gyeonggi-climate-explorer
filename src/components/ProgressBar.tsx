interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      {/* 단계 텍스트 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          진행 상황
        </span>
        <span className="text-sm font-bold text-[#4CAF50]">
          {currentStep} / {totalSteps}
        </span>
      </div>

      {/* 선형 진행률 바 */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4CAF50] to-[#81C784] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 단계 점 표시 */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index < currentStep ? 'bg-[#4CAF50] scale-110' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
