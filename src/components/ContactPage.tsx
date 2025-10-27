import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Send, 
  MessageCircle,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}


export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
          message: ''
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
          <Card className="p-12 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">문의가 접수되었습니다!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              빠른 시일 내에 답변 드리겠습니다.<br />
              보통 1-2 영업일 내에 이메일로 회신해드립니다.
            </p>
            <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">문의하기</h1>
        <p className="text-gray-600 dark:text-gray-300">궁금한 점이나 건의사항을 알려주세요</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 문의 폼 */}
        <div className="lg:col-span-2">
          <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">문의 작성</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

      </div>

    </div>
  );
}