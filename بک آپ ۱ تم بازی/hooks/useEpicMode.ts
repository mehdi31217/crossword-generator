import { useState } from 'react';
import { StoryBook, DictionaryEntry } from '../types';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';

export const useEpicMode = () => {
  const [selectedBook, setSelectedBook] = useState<StoryBook | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [lastWinStars, setLastWinStars] = useState(0);

  const selectBook = (book: StoryBook) => {
    setSelectedBook(book);
  };

  const getChapterWords = (chapterId: number): DictionaryEntry[] | undefined => {
    const fromBook = selectedBook?.chapters.find(c => String(c.id) === String(chapterId))?.words;
    if (fromBook && fromBook.length > 0) return fromBook;
    if (selectedBook) {
      const bundled = [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === selectedBook.id);
      return bundled?.chapters.find(c => String(c.id) === String(chapterId))?.words;
    }
    return undefined;
  };

  const resetEpicMode = () => {
    setSelectedBook(null);
    setShowStoryModal(false);
    setLastWinStars(0);
  };

  return {
    selectedBook,
    showStoryModal,
    lastWinStars,
    setSelectedBook: selectBook,
    setShowStoryModal,
    setLastWinStars,
    getChapterWords,
    resetEpicMode
  };
};
