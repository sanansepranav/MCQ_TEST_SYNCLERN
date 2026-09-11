module.exports = (questions, answerKey, studentAnswers, test) => {

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let score = 0;
  const detailedComparison = [];

  questions.forEach(question => {
    const qNo = question.questionNo;
    
    const correctAnswer = answerKey.answers
      .find(a => a.questionNo === qNo);
    
    const studentAnswer = studentAnswers
      .find(a => a.questionNo === qNo);

    const correctOption = 
      correctAnswer?.correctOption?.toUpperCase();
    const selectedOption = 
      studentAnswer?.selectedOption?.toUpperCase();

    let status = 'unattempted';
    let marksObtained = 0;

    if (!selectedOption) {
      unattemptedCount++;
      status = 'unattempted';
      marksObtained = 0;
    } else if (selectedOption === correctOption) {
      correctCount++;
      status = 'correct';
      marksObtained = question.marks || 
        test.marksPerQuestion || 1;
      score += marksObtained;
    } else {
      incorrectCount++;
      status = 'incorrect';
      marksObtained = 0;
      if (test.negativeMarking) {
        score -= (test.negativeMarks || 0.25);
      }
    }

    detailedComparison.push({
      questionNo: qNo,
      questionText: question.questionText,
      correctAnswer: correctOption,
      studentAnswer: selectedOption || null,
      isCorrect: status === 'correct',
      status,
      marks: question.marks || 1,
      marksObtained
    });
  });

  const totalMarks = questions.reduce(
    (sum, q) => sum + (q.marks || 1), 0
  );
  
  const percentage = totalMarks > 0
    ? Math.round((score / totalMarks) * 100)
    : 0;

  console.log('evaluateAnswers result:', {
    correctCount,
    incorrectCount, 
    unattemptedCount,
    score,
    percentage,
    totalMarks
  });

  return {
    correctCount,
    incorrectCount,
    unattemptedCount,
    score: Math.max(0, score),
    percentage: Math.max(0, percentage),
    totalMarks,
    detailedComparison
  };
};
