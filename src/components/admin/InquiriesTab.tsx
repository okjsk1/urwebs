import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  User,
  MessageCircle,
  Filter,
  Search,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: 'general' | 'bug' | 'feature' | 'account' | 'business';
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'replied' | 'closed';
  createdAt: any;
  inquiryNumber: string;
  isRead: boolean;
}

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Firestore에서 문의 내역 실시간 조회
  useEffect(() => {
    const q = query(
      collection(db, 'inquiries'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inquiriesData: Inquiry[] = [];
      snapshot.forEach((doc) => {
        inquiriesData.push({
          id: doc.id,
          ...doc.data()
        } as Inquiry);
      });
      setInquiries(inquiriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 문의 읽음 처리
  const markAsRead = async (inquiryId: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        isRead: true
      });
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  // 상태 변경
  const updateStatus = async (inquiryId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status: newStatus
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  // 문의 삭제
  const deleteInquiry = async (inquiryId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      setSelectedInquiry(null);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 필터링된 문의 목록
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || inquiry.category === filterCategory;
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categoryLabels: Record<string, string> = {
    general: '일반 문의',
    bug: '버그 신고',
    feature: '기능 제안',
    account: '계정 관련',
    business: '비즈니스 문의'
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels: Record<string, string> = {
    pending: '대기중',
    replied: '답변완료',
    closed: '종료'
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">문의 관리</h2>
            <p className="text-gray-600">
              총 {inquiries.length}개의 문의 (미확인: {inquiries.filter(i => !i.isRead).length}개)
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-800">
              대기중: {inquiries.filter(i => i.status === 'pending').length}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              답변완료: {inquiries.filter(i => i.status === 'replied').length}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 문의 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 필터 & 검색 */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="이름, 이메일, 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">전체 상태</option>
                <option value="pending">대기중</option>
                <option value="replied">답변완료</option>
                <option value="closed">종료</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">전체 유형</option>
                <option value="general">일반 문의</option>
                <option value="bug">버그 신고</option>
                <option value="feature">기능 제안</option>
                <option value="account">계정 관련</option>
                <option value="business">비즈니스 문의</option>
              </select>
            </div>
          </Card>

          {/* 문의 목록 */}
          {loading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">로딩 중...</p>
            </Card>
          ) : filteredInquiries.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">문의 내역이 없습니다.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map((inquiry) => (
                <Card
                  key={inquiry.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                  } ${!inquiry.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    if (!inquiry.isRead) {
                      markAsRead(inquiry.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!inquiry.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <h3 className="font-semibold text-gray-900">{inquiry.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        <span>{inquiry.name}</span>
                        <span>•</span>
                        <span>{inquiry.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={statusColors[inquiry.status]}>
                        {statusLabels[inquiry.status]}
                      </Badge>
                      <Badge className={priorityColors[inquiry.priority]}>
                        {inquiry.priority === 'high' ? '높음' : inquiry.priority === 'medium' ? '보통' : '낮음'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{categoryLabels[inquiry.category]}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {inquiry.createdAt?.toDate?.().toLocaleString('ko-KR') || '방금 전'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 문의 상세 */}
        <div className="lg:col-span-1">
          {selectedInquiry ? (
            <Card className="p-6 sticky top-4">
              <div className="mb-4">
                <Badge className="mb-2">{selectedInquiry.inquiryNumber}</Badge>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedInquiry.subject}
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">보낸 사람</div>
                  <div className="font-medium">{selectedInquiry.name}</div>
                  <div className="text-sm text-gray-600">{selectedInquiry.email}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">유형</div>
                  <Badge>{categoryLabels[selectedInquiry.category]}</Badge>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">우선순위</div>
                  <Badge className={priorityColors[selectedInquiry.priority]}>
                    {selectedInquiry.priority === 'high' ? '높음' : selectedInquiry.priority === 'medium' ? '보통' : '낮음'}
                  </Badge>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">상태</div>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => updateStatus(selectedInquiry.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="pending">대기중</option>
                    <option value="replied">답변완료</option>
                    <option value="closed">종료</option>
                  </select>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">접수 시간</div>
                  <div className="text-sm">
                    {selectedInquiry.createdAt?.toDate?.().toLocaleString('ko-KR') || '방금 전'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="text-xs text-gray-500 mb-2">문의 내용</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  답변하기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteInquiry(selectedInquiry.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">문의를 선택하세요</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}




























<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
