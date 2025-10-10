// 연락처 위젯 - 검색/정렬, 유효성 검사, 인라인 편집, 액션 버튼
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Mail, Phone, Copy, Edit, Trash2, Search, SortAsc } from 'lucide-react';
import { 
  WidgetProps, 
  persistOrLocal, 
  readLocal, 
  isValidEmail, 
  isValidPhone,
  copyToClipboard,
  showToast 
} from './utils/widget-helpers';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

interface ContactState {
  contacts: Contact[];
  showAddForm: boolean;
  newContact: Partial<Contact>;
  searchQuery: string;
  sortBy: 'name' | 'role' | 'company';
  sortOrder: 'asc' | 'desc';
  editingContact: string | null;
}

const DEFAULT_CONTACTS: Contact[] = [
  { 
    id: '1', 
    name: '김팀장', 
    role: '프로젝트 매니저', 
    email: 'kim@company.com', 
    phone: '010-1234-5678',
    company: '테크컴퍼니'
  },
  { 
    id: '2', 
    name: '이개발자', 
    role: 'Frontend Developer', 
    email: 'lee@company.com', 
    phone: '010-2345-6789',
    company: '개발스튜디오'
  },
  { 
    id: '3', 
    name: '박디자이너', 
    role: 'UI/UX Designer', 
    email: 'park@company.com', 
    phone: '010-3456-7890',
    company: '디자인랩'
  }
];

export const ContactWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<ContactState>(() => {
    const saved = readLocal(widget.id, {
      contacts: DEFAULT_CONTACTS,
      showAddForm: false,
      newContact: {},
      searchQuery: '',
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
      editingContact: null
    });
    // contacts가 배열인지 확인하고 아니면 기본값 사용
    return {
      ...saved,
      contacts: Array.isArray(saved.contacts) ? saved.contacts : DEFAULT_CONTACTS
    };
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  const addContact = useCallback(() => {
    const { name, email, phone, role, company, notes } = state.newContact;
    
    if (!name?.trim()) {
      showToast('이름을 입력하세요', 'error');
      return;
    }
    
    if (!email?.trim()) {
      showToast('이메일을 입력하세요', 'error');
      return;
    }

    if (!isValidEmail(email.trim())) {
      showToast('올바른 이메일 형식이 아닙니다', 'error');
      return;
    }

    if (phone && !isValidPhone(phone.trim())) {
      showToast('올바른 전화번호 형식이 아닙니다 (010-1234-5678)', 'error');
      return;
    }

    // 중복 이메일 체크
    if (state.contacts.some(contact => contact.email.toLowerCase() === email.toLowerCase())) {
      showToast('이미 등록된 이메일입니다', 'error');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: name.trim(),
      role: role?.trim() || '',
      email: email.trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      notes: notes?.trim() || ''
    };

    setState(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
      newContact: {},
      showAddForm: false
    }));
    
    showToast('연락처 추가됨', 'success');
  }, [state.newContact, state.contacts]);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact => 
        contact.id === id ? { ...contact, ...updates } : contact
      ),
      editingContact: null
    }));
    showToast('연락처 업데이트됨', 'success');
  }, []);

  const deleteContact = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id)
    }));
    showToast('연락처 삭제됨', 'success');
  }, []);

  const sendEmail = useCallback((email: string) => {
    window.open(`mailto:${email}`, '_blank', 'noopener,noreferrer');
  }, []);

  const makeCall = useCallback((phone: string) => {
    window.open(`tel:${phone}`, '_blank', 'noopener,noreferrer');
  }, []);

  const copyContact = useCallback(async (contact: Contact) => {
    const text = `${contact.name}\n${contact.role}\n${contact.email}\n${contact.phone}`;
    const success = await copyToClipboard(text);
    if (success) {
      showToast('연락처 정보 복사됨', 'success');
    } else {
      showToast('복사 실패', 'error');
    }
  }, []);

  const sortContacts = useCallback((field: 'name' | 'role' | 'company') => {
    setState(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // 필터링 및 정렬된 연락처
  const filteredContacts = useMemo(() => {
    // state.contacts가 undefined이거나 배열이 아닌 경우 빈 배열 사용
    let filtered = Array.isArray(state.contacts) ? state.contacts : [];
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      const aValue = a[state.sortBy] || '';
      const bValue = b[state.sortBy] || '';
      const comparison = aValue.localeCompare(bValue);
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [state.contacts, state.searchQuery, state.sortBy, state.sortOrder]);

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">👥</div>
        <h4 className="font-semibold text-sm text-gray-800">네트워킹 허브</h4>
        <p className="text-xs text-gray-500">연결과 소통의 중심</p>
      </div>

      {/* 검색 및 정렬 */}
      {state.contacts.length > 0 && (
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="연락처 검색..."
              className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
              aria-label="연락처 검색"
            />
          </div>
          <div className="flex gap-1">
            {[
              { key: 'name' as const, label: '이름' },
              { key: 'role' as const, label: '직책' },
              { key: 'company' as const, label: '회사' }
            ].map(sort => (
              <Button
                key={sort.key}
                size="sm"
                variant={state.sortBy === sort.key ? 'default' : 'outline'}
                className="flex-1 h-6 text-xs"
                onClick={() => sortContacts(sort.key)}
                aria-label={`${sort.label}으로 정렬`}
              >
                <SortAsc className={`w-3 h-3 mr-1 ${state.sortBy === sort.key && state.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                {sort.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 연락처 목록 */}
      <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="p-2 bg-gray-50 rounded">
            {state.editingContact === contact.id ? (
              // 편집 모드
              <div className="space-y-2">
                <input
                  type="text"
                  defaultValue={contact.name}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="이름"
                  aria-label="이름 수정"
                />
                <input
                  type="text"
                  defaultValue={contact.role}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="직책"
                  aria-label="직책 수정"
                />
                <input
                  type="email"
                  defaultValue={contact.email}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="이메일"
                  aria-label="이메일 수정"
                />
                <input
                  type="tel"
                  defaultValue={contact.phone}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="전화번호"
                  aria-label="전화번호 수정"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="flex-1 h-6 text-xs"
                    onClick={() => {
                      const inputs = document.querySelectorAll(`input[data-contact-id="${contact.id}"]`) as NodeListOf<HTMLInputElement>;
                      const updates = {
                        name: inputs[0]?.value || contact.name,
                        role: inputs[1]?.value || contact.role,
                        email: inputs[2]?.value || contact.email,
                        phone: inputs[3]?.value || contact.phone
                      };
                      updateContact(contact.id, updates);
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => setState(prev => ({ ...prev, editingContact: null }))}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.role}</div>
                    {contact.company && (
                      <div className="text-xs text-blue-600">{contact.company}</div>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setState(prev => ({ ...prev, editingContact: contact.id }))}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                        aria-label={`${contact.name} 연락처 편집`}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                        aria-label={`${contact.name} 연락처 삭제`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => sendEmail(contact.email)}
                    aria-label={`${contact.name}에게 이메일 보내기`}
                  >
                    <Mail className="w-3 h-3" />
                  </Button>
                  {contact.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => makeCall(contact.phone)}
                      aria-label={`${contact.name}에게 전화 걸기`}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => copyContact(contact)}
                    aria-label={`${contact.name} 연락처 정보 복사`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 새 연락처 추가 폼 */}
      {isEditMode && (
        <div className="space-y-2">
          {!state.showAddForm ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Edit className="w-3 h-3 mr-1" />
              연락처 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <input
                type="text"
                value={state.newContact.name || ''}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  newContact: { ...prev.newContact, name: e.target.value } 
                }))}
                placeholder="이름 *"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="이름 입력 (필수)"
              />
              <input
                type="text"
                value={state.newContact.role || ''}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  newContact: { ...prev.newContact, role: e.target.value } 
                }))}
                placeholder="직책"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="직책 입력"
              />
              <input
                type="email"
                value={state.newContact.email || ''}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  newContact: { ...prev.newContact, email: e.target.value } 
                }))}
                placeholder="이메일 *"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="이메일 입력 (필수)"
              />
              <input
                type="tel"
                value={state.newContact.phone || ''}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  newContact: { ...prev.newContact, phone: e.target.value } 
                }))}
                placeholder="전화번호 (010-1234-5678)"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="전화번호 입력"
              />
              <input
                type="text"
                value={state.newContact.company || ''}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  newContact: { ...prev.newContact, company: e.target.value } 
                }))}
                placeholder="회사명"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="회사명 입력"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addContact}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAddForm: false, 
                    newContact: {} 
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
