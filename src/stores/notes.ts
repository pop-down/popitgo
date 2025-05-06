import { writable } from 'svelte/store';
import { noteService } from '@services/supabase';

// 노트 인터페이스
export interface Note {
  id: string;
  userId: string;
  eventId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 서비스에서 반환되는 노트 인터페이스
interface ServiceNote {
  id: number;
  userId: string;
  eventId: number;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 노트 상태 인터페이스
export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

// 초기 노트 상태
const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null
};

// 노트 스토어 생성
function createNotesStore() {
  const store = writable<NotesState>(initialState);
  const { subscribe, set, update } = store;

  // 노트 목록 가져오기
  const fetchNotes = async () => {
    try {
      const notes = await noteService.list();
      update(state => ({
        ...state,
        notes: notes.map((note: ServiceNote) => ({
          id: note.id.toString(),
          userId: note.userId,
          eventId: note.eventId.toString(),
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('노트 목록을 가져오는 중 오류 발생:', error);
      update(state => ({
        ...state,
        error: '노트 목록을 가져오는데 실패했습니다.',
        isLoading: false
      }));
    }
  };

  // 노트 추가
  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await noteService.create({
        eventId: parseInt(note.eventId),
        content: note.content
      });
      
      update(state => ({
        ...state,
        notes: [...state.notes, {
          ...note,
          id: result.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }));
    } catch (error) {
      console.error('노트 추가 중 오류 발생:', error);
      throw error;
    }
  };

  // 노트 수정
  const updateNote = async (id: string, content: string) => {
    try {
      await noteService.update(parseInt(id), { content });
      
      update(state => ({
        ...state,
        notes: state.notes.map(note => 
          note.id === id ? { ...note, content, updatedAt: new Date() } : note
        )
      }));
    } catch (error) {
      console.error('노트 수정 중 오류 발생:', error);
      throw error;
    }
  };

  // 노트 삭제
  const deleteNote = async (id: string) => {
    try {
      await noteService.delete(parseInt(id));
      
      update(state => ({
        ...state,
        notes: state.notes.filter(note => note.id !== id)
      }));
    } catch (error) {
      console.error('노트 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  // 이벤트별 노트 가져오기
  const getNotesByEventId = async (eventId: string) => {
    try {
      const notes = await noteService.listByEvent(parseInt(eventId));
      return notes.map((note: ServiceNote) => ({
        id: note.id.toString(),
        userId: note.userId,
        eventId: note.eventId.toString(),
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
    } catch (error) {
      console.error('이벤트별 노트를 가져오는 중 오류 발생:', error);
      throw error;
    }
  };

  return {
    subscribe,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    getNotesByEventId
  };
}

// 노트 스토어 내보내기
export const notesStore = createNotesStore(); 