import React, { useState, useEffect } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard, EliteLoader } from '../components/EliteComponents';
import { generateTriviaQuestion } from '../services/geminiService';

const NebulaTrivia: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{question: string, options: string[], correctIndex: number} | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [topic, setTopic] = useState("General Knowledge");

  const topics = ["Technology", "History", "Space", "Art", "Physics"];

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      // Pick random topic if general
      const currentTopic = topic === "Random" ? topics[Math.floor(Math.random() * topics.length)] : topic;
      const qData = await generateTriviaQuestion(currentTopic, currentLevel);
      setData(qData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, topic]);

  const handleAnswer = (index: number) => {
    if (selected !== null) return; // Prevent multi-click
    setSelected(index);

    setTimeout(() => {
      const isCorrect = index === data?.correctIndex;
      if (isCorrect) {
        onGameOver(1000, true);
      } else {
        onGameOver(0, false);
      }
    }, 1500);
  };

  if (!data && !loading) return <div className="text-red-500">Failed to load neural link.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-6">
        <h2 className={ELITE_STYLES.h2}>Level {currentLevel}: Nebula Trivia</h2>
        <select 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)}
          className="bg-elite-base border border-elite-gold text-elite-gold text-xs p-2 font-serif uppercase"
        >
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <EliteCard className="w-full min-h-[400px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center">
            <EliteLoader />
            <p className="mt-4 text-elite-gold animate-pulse text-sm font-mono">CONSULTING THE ORACLE...</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl md:text-2xl text-center mb-10 font-serif leading-relaxed text-gray-200">
              {data?.question}
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {data?.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`
                    p-4 border text-left transition-all duration-300 relative overflow-hidden group
                    ${selected === null 
                      ? 'border-slate-700 hover:border-elite-gold hover:bg-slate-900' 
                      : i === data.correctIndex 
                        ? 'border-green-500 bg-green-900/20' 
                        : selected === i 
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-slate-800 opacity-50'
                    }
                  `}
                >
                  <span className="font-mono text-elite-gold mr-4 opacity-50 group-hover:opacity-100">
                    {['A', 'B', 'C', 'D'][i]} //
                  </span>
                  <span className="font-sans tracking-wide text-sm md:text-base">
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </EliteCard>
    </div>
  );
};

export default NebulaTrivia;