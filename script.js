document.addEventListener('DOMContentLoaded', function() {
    // ============== إدارة القائمة المتنقلة ==============
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNavLinks = document.getElementById('mobile-nav-links');
    const navLinks = document.querySelectorAll('#mobile-nav-links a');
    
    if (menuToggle && mobileNavLinks) {
        menuToggle.addEventListener('click', function() {
            mobileNavLinks.style.display = mobileNavLinks.style.display === 'block' ? 'none' : 'block';
            toggleMenuIcon();
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNavLinks.style.display = 'none';
                toggleMenuIcon(false);
            });
        });
    }
    
    function toggleMenuIcon(show = null) {
        const lines = document.querySelectorAll('.menu-line');
        if (show === null) {
            menuToggle.classList.toggle('active');
        } else {
            menuToggle.classList.toggle('active', show);
        }
    }
    
    // ============== التمرير السلس ==============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============== تغيير لون الشريط العلوي عند التمرير ==============
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(45, 55, 72, 0.98)';
                navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.backgroundColor = 'rgba(45, 55, 72, 0.9)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // ============== إدارة النوافذ المنبثقة ==============
    const supportBtn = document.getElementById('supportBtn');
    const reportBtn = document.getElementById('reportBtn');
    const supportModal = document.getElementById('supportModal');
    const reportModal = document.getElementById('reportModal');
    const closeBtns = document.querySelectorAll('.modal-close');
    
    // التحقق من وجود العناصر قبل إضافة الأحداث
    if (supportBtn && supportModal) {
        supportBtn.addEventListener('click', function() {
            supportModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (reportBtn && reportModal) {
        reportBtn.addEventListener('click', function() {
            reportModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // ============== جمع معلومات الجهاز ==============
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
        const isTablet = /Tablet|iPad/i.test(userAgent);
        
        let deviceType = 'كمبيوتر';
        if (isTablet) deviceType = 'تابلت';
        else if (isMobile) deviceType = 'هاتف';
        
        let browser = 'متصفح غير معروف';
        if (/Edg/i.test(userAgent)) browser = 'Edge';
        else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/Chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/Safari/i.test(userAgent)) browser = 'Safari';
        else if (/Opera|OPR/i.test(userAgent)) browser = 'Opera';
        
        const now = new Date();
        const dateTime = now.toLocaleString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        return {
            deviceType,
            browser,
            screen: `${window.screen.width} × ${window.screen.height}`,
            os: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateTime,
            pageUrl: window.location.href
        };
    }
    
    // ============== إعدادات التليجرام ==============
    const BOT_TOKEN = '8063526265:AAHrNSUznGVkaVmVl02gqJTa2Xcl8Xl02js';
    const CHAT_ID = '7392730199';
    
    async function sendToTelegram(message, isReport = false) {
        const deviceInfo = getDeviceInfo();
        const requestType = isReport ? 'بلاغ جديد' : 'طلب دعم';
        
        const fullMessage = `
<b>${requestType}</b>
────────────────
${message}
────────────────
<b>معلومات الجهاز:</b>
📱 <b>نوع الجهاز:</b> ${deviceInfo.deviceType}
🖥️ <b>نظام التشغيل:</b> ${deviceInfo.os}
🌐 <b>المتصفح:</b> ${deviceInfo.browser}
📏 <b>دقة الشاشة:</b> ${deviceInfo.screen}
🗣️ <b>اللغة:</b> ${deviceInfo.language}
⏰ <b>الوقت:</b> ${deviceInfo.dateTime}
📍 <b>المنطقة الزمنية:</b> ${deviceInfo.timezone}
🔗 <b>رابط الصفحة:</b> ${deviceInfo.pageUrl}
        `;
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: fullMessage,
                    parse_mode: 'HTML'
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            return false;
        }
    }
    
    async function sendPhotoToTelegram(message, photoFile, isReport = false) {
        const deviceInfo = getDeviceInfo();
        const requestType = isReport ? 'بلاغ مع صورة' : 'طلب دعم مع صورة';
        
        const caption = `
<b>${requestType}</b>
────────────────
${message}
────────────────
<b>معلومات الجهاز:</b>
📱 <b>نوع الجهاز:</b> ${deviceInfo.deviceType}
🖥️ <b>نظام التشغيل:</b> ${deviceInfo.os}
🌐 <b>المتصفح:</b> ${deviceInfo.browser}
📏 <b>دقة الشاشة:</b> ${deviceInfo.screen}
⏰ <b>الوقت:</b> ${deviceInfo.dateTime}
        `;
        
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('photo', photoFile);
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error sending photo to Telegram:', error);
            return false;
        }
    }
    
    // ============== إرسال طلب الدعم ==============
    const sendSupport = document.getElementById('sendSupport');
    const supportText = document.getElementById('supportText');
    
    if (sendSupport && supportText) {
        sendSupport.addEventListener('click', async function() {
            const message = supportText.value.trim();
            
            if (!message) {
                alert('الرجاء كتابة رسالة الدعم');
                return;
            }
            
            // عرض حالة التحميل
            const originalText = sendSupport.innerHTML;
            sendSupport.innerHTML = '<i class="fas fa-spinner"></i> جاري الإرسال...';
            sendSupport.disabled = true;
            
            // إرسال الرسالة
            const success = await sendToTelegram(message, false);
            
            if (success) {
                alert('تم إرسال طلب الدعم بنجاح!');
                supportModal.style.display = 'none';
                supportText.value = '';
            } else {
                alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً');
            }
            
            // إعادة تعيين الزر
            sendSupport.innerHTML = originalText;
            sendSupport.disabled = false;
        });
    }
    
    // ============== إرسال البلاغ ==============
    const sendReport = document.getElementById('sendReport');
    const reportText = document.getElementById('reportText');
    const reportImage = document.getElementById('reportImage');
    const fileLabel = document.getElementById('fileLabel');
    
    if (sendReport && reportText && reportImage && fileLabel) {
        sendReport.addEventListener('click', async function() {
            const message = reportText.value.trim();
            
            if (!message) {
                alert('الرجاء وصف المشكلة');
                return;
            }
            
            // عرض حالة التحميل
            const originalText = sendReport.innerHTML;
            sendReport.innerHTML = '<i class="fas fa-spinner"></i> جاري الإرسال...';
            sendReport.disabled = true;
            
            let success;
            if (reportImage.files.length > 0) {
                success = await sendPhotoToTelegram(message, reportImage.files[0], true);
            } else {
                success = await sendToTelegram(message, true);
            }
            
            if (success) {
                alert('تم إرسال البلاغ بنجاح!');
                reportModal.style.display = 'none';
                reportText.value = '';
                reportImage.value = '';
                fileLabel.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> <span>إرفاق صورة (اختياري)</span>';
            } else {
                alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً');
            }
            
            // إعادة تعيين الزر
            sendReport.innerHTML = originalText;
            sendReport.disabled = false;
        });
        
        reportImage.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileLabel.innerHTML = `<i class="fas fa-check"></i> <span>${this.files[0].name}</span>`;
            } else {
                fileLabel.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> <span>إرفاق صورة (اختياري)</span>';
            }
        });
    }
});