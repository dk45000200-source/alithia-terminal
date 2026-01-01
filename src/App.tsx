import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './App.css';

function App() {
  // حالة النظام
  const [output, setOutput] = useState<string[]>([
    '■ : طرفية أليثيا',
    '● نظام عربي - 6 أوامر',
    '────────────────────',
    '📝 اكتب أمراً أو استخدم الأزرار',
    ''
  ]);
  
  const [input, setInput] = useState('');
  const [virtualPath, setVirtualPath] = useState('~');
  const [virtualFS, setVirtualFS] = useState<Record<string, string[]>>({
    '~': ['ملفات', 'مجلدات', 'نظام', 'تطبيقات'],
    '~/ملفات': ['مشروع_أليثيا.txt', 'وثائق.pdf'],
    '~/مجلدات': ['مشاريع', 'نسخ'],
    '~/نظام': ['إعدادات.conf', 'سجلات.log'],
  });
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // خريطة الأوامر الذكية
  const commandAliases: Record<string, string> = {
    'ع': 'عر', 'عرض': 'عر', 'عر': 'عر',
    'م': 'مسا', 'مسار': 'مسا', 'مسا': 'مسا',
    'ح': 'حد', 'حذ': 'حد', 'حذف': 'حد',
    'ث': 'ثبت', 'تثبيت': 'ثبت', 'ثبت': 'ثبت',
    'ف': 'ملف', 'ملف': 'ملف',
    'ن': 'انش', 'إنشاء': 'انش', 'انش': 'انش',
    'مساعدة': 'مع', '؟': 'مع', 'مع': 'مع',
    'مسح': 'مسح', 'م': 'مسح',
    '~': 'منز', 'منزل': 'منز', 'منز': 'منز'
  };

  // تنفيذ الأوامر
  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;
    
    // إضافة الأمر للمخرجات
    setOutput(prev => [...prev, `: ${trimmedCmd}`]);
    
    // استخراج الأمر والمعامل
    const firstWord = trimmedCmd.split(' ')[0];
    const command = commandAliases[firstWord] || firstWord;
    const arg = trimmedCmd.substring(firstWord.length).trim();
    
    // قائمة الأوامر الصحيحة
    const validCommands = ['عر', 'مسا', 'حد', 'ثبت', 'ملف', 'انش', 'مع', 'مسح', 'منز'];
    
    if (!validCommands.includes(command)) {
      setOutput(prev => [...prev,
        `❌ "${firstWord}" - أمر غير معروف`,
        '',
        '💡 **الأوامر المتاحة:**',
        '   ع / عرض   - عرض الملفات',
        '   مسا / مسار - تغيير المسار',
        '   حد / حذف  - حذف ملف',
        '   انش       - إنشاء ملف/مجلد',
        '   مع / ؟    - المساعدة',
        '   مسح       - تنظيف الشاشة',
        '   منزل      - العودة للمنزل',
        ''
      ]);
      setInput('');
      return;
    }
    
    // تنفيذ الأمر
    switch(command) {
      case 'عر':
        const files = virtualFS[virtualPath] || [];
        setOutput(prev => [...prev,
          `📁 ${virtualPath}:`,
          '─'.repeat(40),
          ...files.map(f => ` • ${f}`),
          files.length === 0 ? '   (فارغ)' : '',
          '─'.repeat(40),
          ''
        ]);
        break;
        
      case 'مسا':
        if (!arg) {
          setOutput(prev => [...prev,
            `📍 المسار الحالي: ${virtualPath}`,
            '📝 استخدم: مسا [مسار]',
            '   مثال: مسا ملفات',
            '   مثال: مسا مجلدات',
            '   مثال: مسا ~ (منزل)',
            ''
          ]);
        } else {
          let newPath = arg === '~' || arg === 'منزل' ? '~' : 
                       arg.startsWith('~') ? arg : `~/${arg}`;
          
          if (virtualFS[newPath] !== undefined || newPath === '~') {
            setVirtualPath(newPath);
            setOutput(prev => [...prev, `✅ تم: ${newPath}`, '']);
          } else {
            setOutput(prev => [...prev,
              `❌ لا يوجد: ${newPath}`,
              '💡 المسارات المتاحة:',
              '   ملفات',
              '   مجلدات',
              '   نظام',
              ''
            ]);
          }
        }
        break;
        
      case 'حد':
        if (!arg) {
          setOutput(prev => [...prev,
            '🗑️  استخدم: حد [اسم]',
            '⚠️  سيطلب التأكيد',
            ''
          ]);
        } else {
          setOutput(prev => [...prev,
            `❓ تأكيد حذف "${arg}"؟ (ن/لا)`,
            `: حذف ${arg} ن`,
            `✅ حُذف: ${arg}`,
            ''
          ]);
        }
        break;
        
      case 'انش':
        if (!arg) {
          setOutput(prev => [...prev,
            '🆕 إنشاء ملف أو مجلد',
            '📝 استخدم: انش [اسم]',
            '   مثال: انش ملف_جديد.txt',
            '   مثال: انش مجلد_جديد',
            ''
          ]);
        } else {
          const isFolder = !arg.includes('.');
          setVirtualFS(prev => {
            const newFS = { ...prev };
            if (!newFS[virtualPath]) newFS[virtualPath] = [];
            if (!newFS[virtualPath].includes(arg)) {
              newFS[virtualPath] = [...newFS[virtualPath], arg];
              if (isFolder) {
                newFS[`${virtualPath}/${arg}`.replace('//', '/')] = [];
              }
            }
            return newFS;
          });
          
          setOutput(prev => [...prev,
            `🆕 ${isFolder ? 'مجلد' : 'ملف'} جديد:`,
            `   📍 ${virtualPath}/${arg}`,
            `   📊 النوع: ${isFolder ? 'مجلد 📁' : 'ملف 📄'}`,
            `✅ تم الإنشاء بنجاح`,
            ''
          ]);
        }
        break;
        
      case 'مع':
        setOutput(prev => [...prev,
          ': 🦉 نظام أليثيا العربي',
          '════════════════════════',
          '',
          '🎮 **الأوامر الأساسية:**',
          '  📁 ع / عرض   - عرض الملفات',
          '  📍 مسا / مسار - تغيير المسار',
          '  🗑️  حد / حذف  - حذف ملف',
          '  📦 ثبت       - تثبيت حزمة',
          '  📄 ملف       - فتح ملف',
          '  🆕 انش       - إنشاء ملف/مجلد',
          '',
          '⚡ **أوامر التحكم:**',
          '  ❓ مع / ؟    - هذه الرسالة',
          '  🧹 مسح       - تنظيف الشاشة',
          '  🏠 منزل      - العودة للمنزل',
          '',
          '🔧 **نظام 3 أحرف:**',
          '   • كل أمر يمكن كتابته بثلاثة أحرف',
          '   • النظام يتعرف على الاختصارات',
          '   • التغييرات ظاهرية وآمنة',
          '════════════════════════',
          ''
        ]);
        break;
        
      case 'مسح':
        setOutput([
          '■ : طرفية أليثيا',
          '● نظام عربي - 6 أوامر',
          '────────────────────',
          '📝 اكتب أمراً أو استخدم الأزرار',
          ''
        ]);
        break;
        
      case 'منز':
        setVirtualPath('~');
        setOutput(prev => [...prev, '🏠 ~', '']);
        break;
        
      case 'ثبت':
        setOutput(prev => [...prev,
          '📦 نظام التثبيت',
          '💡 في النسخة الحالية،',
          '   هذا أمر محاكاة للتثبيت',
          '📥 جاري تثبيت الحزم...',
          '✅ تم التثبيت بنجاح',
          ''
        ]);
        break;
        
      case 'ملف':
        setOutput(prev => [...prev,
          '📄 نظام الملفات',
          '💡 في النسخة الحالية،',
          '   هذا أمر محاكاة لفتح الملفات',
          '📖 جاري فتح الملف...',
          '✅ تم فتح الملف بنجاح',
          ''
        ]);
        break;
        
      default:
        setOutput(prev => [...prev,
          `⚠️  أمر غير معالج: ${command}`,
          ''
        ]);
    }
    
    setInput('');
  };

  // التعامل مع لوحة المفاتيح
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['عر ', 'مسا ', 'حد ', 'انش ', 'مع ', 'مسح', 'منز'];
      for (const cmd of commands) {
        if (cmd.startsWith(input.trim())) {
          setInput(cmd);
          break;
        }
      }
    }
  };

  // التركيز على الإدخال
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // التمرير التلقائي
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // الأوامر السريعة
  const quickCommands = [
    { cmd: 'ع', label: 'عرض' },
    { cmd: 'انش ملف_جديد', label: 'إنشاء' },
    { cmd: 'منزل', label: 'منزل' },
    { cmd: 'مساعدة', label: 'مساعدة' },
    { cmd: 'مسح', label: 'مسح' }
  ];

  return (
    <div className="app">
      <div className="terminal">
        <div className="terminal-header">
          <div className="header-title">
            <span className="blink">■</span>
            <span> : طرفية أليثيا</span>
          </div>
          <div className="header-status">
            <span className="status">●</span>
            <span>6 أوامر | 3 أحرف</span>
          </div>
        </div>
        
        <div ref={outputRef} className="output">
          {output.map((line, index) => (
            <div key={index} className="line">{line}</div>
          ))}
        </div>
        
        <div className="input-container">
          <div className="prompt">
            <span className="prompt-symbol">:</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder='اكتب أمراً...'
              dir="rtl"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          
          <div className="quick-buttons">
            {quickCommands.map((item, idx) => (
              <button
                key={idx}
                className="quick-btn"
                onClick={() => executeCommand(item.cmd)}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="help-row">
            <span className="help-item">↑↓ تاريخ</span>
            <span className="help-item">Tab إكمال</span>
            <span className="help-item">Enter تنفيذ</span>
            <span className="help-item">: نظام أليثيا</span>
          </div>
        </div>
      </div>
      
      <div className="footer">
        <span className="footer-text">: طرفية أليثيا | نظام عربي | 6 أوامر × 3 أحرف</span>
      </div>
    </div>
  );
}

export default App;
