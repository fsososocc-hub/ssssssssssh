/**
 * AI Commerce OS - Custom React Hook (useAI)
 * High-performing hooks to execute seamless AI tasks such as SEO audits, translation presets,
 * and smart copywriting, leveraging the backend and state context.
 */

import { useState } from 'react';
import { useAIContext } from '../context/AIContext';
import { AIService } from '../services/ai.service';

export const useAI = () => {
  const context = useAIContext();
  const [isSeoRunning, setIsSeoRunning] = useState(false);
  const [copyOutput, setCopyOutput] = useState('');
  const [isCopyRunning, setIsCopyRunning] = useState(false);
  const [translatedData, setTranslatedData] = useState<{ title: string; description: string } | null>(null);
  const [isTranslationRunning, setIsTranslationRunning] = useState(false);

  /**
   * Run SEO inspection on a page's metadata
   */
  const inspectSEOValue = (title: string, description: string) => {
    setIsSeoRunning(true);
    try {
      const audit = AIService.analyzeSEO(title, description);
      return audit;
    } finally {
      setIsSeoRunning(false);
    }
  };

  /**
   * Run instant luxury copywriting rewrite via API or local fallback
   */
  const writeProductCopy = async (
    title: string,
    keywords: string,
    tone: 'elegant' | 'scientific' | 'warm' | 'active',
    length = 200
  ) => {
    setIsCopyRunning(true);
    setCopyOutput('');
    try {
      const output = await AIService.generateProductCopy(title, keywords, tone, length);
      setCopyOutput(output);
      return output;
    } catch (err) {
      console.error('Hooks copywriting error:', err);
      return '';
    } finally {
      setIsCopyRunning(false);
    }
  };

  /**
   * Run high-end luxury business level localization to target language
   */
  const translateProductToTarget = async (
    title: string,
    description: string,
    targetLang: 'de' | 'it' | 'fr' | 'ja'
  ) => {
    setIsTranslationRunning(true);
    setTranslatedData(null);
    try {
      const output = await AIService.generateTranslation(title, description, targetLang);
      setTranslatedData(output);
      return output;
    } catch (err) {
      console.error('Hooks localization error:', err);
      return null;
    } finally {
      setIsTranslationRunning(false);
    }
  };

  return {
    ...context,
    isSeoRunning,
    inspectSEOValue,
    copyOutput,
    isCopyRunning,
    writeProductCopy,
    translatedData,
    isTranslationRunning,
    translateProductToTarget,
  };
};
