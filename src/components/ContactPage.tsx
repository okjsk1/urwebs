import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: 'general' | 'bug' | 'feature' | 'account' | 'business';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const mockFAQs: FAQ[] = [
  {
    id: 1,
    question: '위젯이 저장되지 않아요',
    answer: '편집 모드에서 위젯 배치 후 반드시 "편집 완료" 버튼을 눌러주세요. 브라우저의 쿠키 설정도 확인해보시기 바랍니다.',
    category: '사용법'
  },
  {
    id: 2,
    question: '새로운 카테고리 추가는 언제 되나요?',
    answer: '사용자 요청이 많은 카테고리부터 순차적으로 추가하고 있습니다. 평균 2-3주 소요됩니다.',
    category: '기능'
  },
  {
    id: 3,
    question: '모바일에서 사용할 수 있나요?',
    answer: '현재는 데스크톱 최적화되어 있지만, 모바일 버전도 개발 중입니다.',
    category: '호환성'
  },
  {
    id: 4,
    question: '데이터는 어떻게 저장되나요?',
    answer: '모든 설정은 브라우저의 로컬 스토리지에 저장되며, 서버에는 저장되지 않습니다.',
    category: '개인정보'
  }
];

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { value: 'general', label: '일반 문의' },
    { value: 'bug', label: '버그 신고' },
    { value: 'feature', label: '기능 제안' },
    { value: 'account', label: '계정 관련' },
    { value: 'business', label: '비즈니스 문의' }
  ];

  const priorities = [
    { value: 'low', label: '낮음', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: '보통', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: '높음', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Firestore에 문의 내역 저장
      await addDoc(collection(db, 'inquiries'), {
        ...form,
        status: 'pending', // 대기중
        createdAt: serverTimestamp(),
        inquiryNumber: `INQ-${Date.now().toString().slice(-6)}`,
        isRead: false, // 읽지 않음
      });
      
      console.log('문의 내용이 저장되었습니다:', form);
      setIsSubmitted(true);
      
      // 3초 후 폼 리셋
      setTimeout(() => {
        setIsSubmitted(false);
        setForm({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
          priority: 'medium'
        });
      }, 3000);
      
    } catch (error) {
      console.error('문의 저장 실패:', error);
      alert('문의 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Card className="p-12 bg-green-50 border-green-200">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">문의가 접수되었습니다!</h2>
            <p className="text-gray-600 mb-4">
              빠른 시일 내에 답변 드리겠습니다.<br />
              보통 1-2 영업일 내에 이메일로 회신해드립니다.
            </p>
            <Badge className="bg-blue-100 text-blue-800">
              문의번호: INQ-{Date.now().toString().slice(-6)}
            </Badge>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">문의하기</h1>
        <p className="text-gray-600">궁금한 점이나 건의사항을 알려주세요</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 문의 폼 */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">문의 작성</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문의 유형 *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <Input
                  required
                  value={form.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="문의 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용 *
                </label>
                <Textarea
                  required
                  value={form.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="구체적인 문의 내용을 입력해주세요"
                  className="h-40 resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                문의 보내기
              </Button>
            </form>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 연락처 정보 */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">연락처 정보</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">이메일</div>
                  <div className="text-sm text-gray-600">support@urwebs.com</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">전화번호</div>
                  <div className="text-sm text-gray-600">1588-1234</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">운영시간</div>
                  <div className="text-sm text-gray-600">
                    평일 09:00 - 18:00<br />
                    (주말 및 공휴일 휴무)
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">주소</div>
                  <div className="text-sm text-gray-600">
                    서울특별시 강남구<br />
                    테헤란로 123길 45
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 응답 시간 안내 */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">응답 시간 안내</h3>
            </div>
            <div className="text-sm text-blue-800">
              <div className="mb-2">• 일반 문의: 1-2 영업일</div>
              <div className="mb-2">• 버그 신고: 당일 내</div>
              <div className="mb-2">• 기능 제안: 3-5 영업일</div>
              <div>• 비즈니스 문의: 1 영업일</div>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">자주 묻는 질문</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockFAQs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <button
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {faq.category}
                  </Badge>
                </div>
              </button>
              
              {expandedFAQ === faq.id && (
                <div className="px-6 pb-6 border-t bg-gray-50">
                  <div className="pt-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}