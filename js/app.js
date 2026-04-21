/**
 * 广州农商银行 MGM 裂变营销 H5
 * 核心交互逻辑
 */

// ============================================
// 数据模拟
// ============================================

const mockData = {
    user: {
        name: '',
        phone: '',
        code: '',
        registered: false
    },
    records: [
        { name: '李女士', initial: '李', date: '2026-04-18', status: 'pending', statusText: '资产达标审核中' },
        { name: '王先生', initial: '王', date: '2026-04-15', status: 'claimed', statusText: '已达标已领取' },
        { name: '陈先生', initial: '陈', date: '2026-04-10', status: 'waiting', statusText: '已达标待领取' }
    ],
    gifts: [
        { name: '品牌保温杯套装', date: '2026-04-16', progress: 100, status: 'claimed' },
        { name: '精美瓷器套装', date: '2026-04-18', progress: 100, status: 'available' },
        { name: '高端床上四件套', date: '2026-04-20', progress: 30, status: 'pending' }
    ]
};

// ============================================
// 页面导航
// ============================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = 'block';
        page.scrollTop = 0;
    }
}

// ============================================
// Toast 提示
// ============================================

function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    toastMsg.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// ============================================
// Modal 弹窗
// ============================================

function showModal(title, msg, icon = '✓', callback = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMsg = document.getElementById('modal-msg');
    const modalIcon = document.getElementById('modal-icon');
    const modalBtn = document.getElementById('modal-btn');

    modalTitle.textContent = title;
    modalMsg.textContent = msg;
    modalIcon.textContent = icon;
    modalIcon.className = 'modal-icon' + (icon === '✕' ? ' fail' : '');
    modal.style.display = 'flex';

    modalBtn.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// ============================================
// 验证码逻辑
// ============================================

let codeInterval = null;
let codeCooldown = 0;

function startCodeCooldown() {
    const btn = document.getElementById('btn-code');
    codeCooldown = 60;
    btn.disabled = true;
    btn.textContent = `${codeCooldown}s`;

    codeInterval = setInterval(() => {
        codeCooldown--;
        if (codeCooldown <= 0) {
            clearInterval(codeInterval);
            btn.disabled = false;
            btn.textContent = '获取验证码';
        } else {
            btn.textContent = `${codeCooldown}s`;
        }
    }, 1000);
}

function sendCode() {
    const phone = document.getElementById('input-phone').value.trim();
    const hint = document.getElementById('hint-phone');

    if (!phone) {
        hint.textContent = '请输入手机号';
        document.getElementById('input-phone').classList.add('error');
        return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
        hint.textContent = '手机号格式不正确';
        document.getElementById('input-phone').classList.add('error');
        return;
    }

    hint.textContent = '';
    document.getElementById('input-phone').classList.remove('error');
    document.getElementById('input-phone').classList.add('success');
    startCodeCooldown();
    showToast('验证码已发送');
}

// ============================================
// 表单验证
// ============================================

function validateName() {
    const name = document.getElementById('input-name').value.trim();
    const hint = document.getElementById('hint-name');
    const input = document.getElementById('input-name');

    if (!name) {
        hint.textContent = '请输入姓名';
        input.classList.add('error');
        return false;
    }
    if (name.length < 2) {
        hint.textContent = '姓名至少2个字符';
        input.classList.add('error');
        return false;
    }
    hint.textContent = '';
    input.classList.remove('error');
    input.classList.add('success');
    return true;
}

function validatePhone() {
    const phone = document.getElementById('input-phone').value.trim();
    const hint = document.getElementById('hint-phone');
    const input = document.getElementById('input-phone');

    if (!phone) {
        hint.textContent = '请输入手机号';
        input.classList.add('error');
        return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        hint.textContent = '手机号格式不正确';
        input.classList.add('error');
        return false;
    }
    hint.textContent = '';
    input.classList.remove('error');
    input.classList.add('success');
    return true;
}

function validateCode() {
    const code = document.getElementById('input-code').value.trim();
    const hint = document.getElementById('hint-code');
    const input = document.getElementById('input-code');

    if (!code) {
        hint.textContent = '请输入验证码';
        input.classList.add('error');
        return false;
    }
    if (code.length < 4) {
        hint.textContent = '验证码为6位数字';
        input.classList.add('error');
        return false;
    }
    hint.textContent = '';
    input.classList.remove('error');
    input.classList.add('success');
    return true;
}

function updateSubmitBtn() {
    const agree = document.getElementById('agree-check').checked;
    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const code = document.getElementById('input-code').value.trim();

    const btn = document.getElementById('btn-submit');
    btn.disabled = !(agree && name && phone && code);
}

// ============================================
// 生成推荐码
// ============================================

function generateCode() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `GZRC${dateStr}${random}`;
}

// ============================================
// 提交报名
// ============================================

function submitRegister() {
    if (!validateName() || !validatePhone() || !validateCode()) {
        showModal('提交失败', '请完善报名信息', '✕');
        return;
    }

    if (!document.getElementById('agree-check').checked) {
        showModal('提示', '请阅读并同意活动规则与条款', '✕');
        return;
    }

    // 模拟验证码校验
    const code = document.getElementById('input-code').value.trim();
    if (code !== '123456' && code.length === 6) {
        // 允许测试码 123456 通过
    } else if (code.length !== 6) {
        showModal('验证码错误', '请输入6位验证码', '✕');
        return;
    }

    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const regCode = generateCode();

    mockData.user.name = name;
    mockData.user.phone = phone;
    mockData.user.code = regCode;
    mockData.user.registered = true;

    document.getElementById('my-code').textContent = regCode;
    document.getElementById('display-code').textContent = regCode;

    showModal('报名成功', `您的推荐码：${regCode}\n快去分享给好友吧！`, '✓', () => {
        showPage('page-referral');
        renderRecords();
    });
}

// ============================================
// 渲染推荐记录
// ============================================

function renderRecords() {
    const list = document.getElementById('records-list');
    const count = document.getElementById('record-count');

    count.textContent = `${mockData.records.length}人`;

    let html = '';
    mockData.records.forEach(r => {
        const badgeClass = r.status === 'claimed' ? 'badge-success' :
                           r.status === 'waiting' ? 'badge-waiting' : 'badge-pending';
        html += `
            <div class="record-item">
                <div class="record-avatar">${r.initial}</div>
                <div class="record-info">
                    <div class="record-name">${r.name}</div>
                    <div class="record-status">${r.date} · ${r.statusText}</div>
                </div>
                <span class="record-badge ${badgeClass}">${r.status === 'claimed' ? '已领取' : r.status === 'waiting' ? '待领取' : '审核中'}</span>
            </div>
        `;
    });
    list.innerHTML = html;
}

// ============================================
// 渲染礼品列表
// ============================================

function renderGifts() {
    const list = document.getElementById('gifts-list');
    const claimedCount = document.getElementById('claimed-count');
    const remainCount = document.getElementById('remain-count');

    const claimed = mockData.gifts.filter(g => g.status === 'claimed').length;
    claimedCount.textContent = claimed;
    remainCount.textContent = 3 - claimed;

    let html = '';
    mockData.gifts.forEach(g => {
        let btnClass = 'disabled';
        let btnText = '未达标';
        let fillClass = 'done';

        if (g.status === 'available') {
            btnClass = 'active';
            btnText = '立即领取';
        } else if (g.status === 'claimed') {
            btnClass = 'claimed';
            btnText = '已领取';
        } else {
            fillClass = 'process';
        }

        html += `
            <div class="gift-card">
                <div class="gift-top">
                    <span class="gift-name">🎁 ${g.name}</span>
                    <span class="gift-date">${g.date}</span>
                </div>
                <div class="gift-progress">
                    <div class="fill ${fillClass}" style="width:${g.progress}%"></div>
                </div>
                <div class="gift-status">资产达标进度：${g.progress}%</div>
                <button class="btn-claim ${btnClass}" ${g.status !== 'available' ? 'disabled' : ''} onclick="claimGift('${g.name}')">${btnText}</button>
            </div>
        `;
    });
    list.innerHTML = html;
}

// ============================================
// 领取礼品
// ============================================

function claimGift(giftName) {
    const gift = mockData.gifts.find(g => g.name === giftName);
    if (gift && gift.status === 'available') {
        gift.status = 'claimed';
        renderGifts();
        showModal('领取成功', `您已成功领取：${giftName}`, '✓');
    }
}

// ============================================
// 分享
// ============================================

function shareCode() {
    const code = mockData.user.code || document.getElementById('display-code').textContent;
    const text = `我在参加广州农商银行推荐有礼活动，我的推荐码是：${code}，成功推荐最高可获双份礼品！`;

    if (navigator.share) {
        navigator.share({
            title: '广州农商银行推荐有礼',
            text: text,
            url: window.location.href
        }).catch(() => {});
    } else {
        // 降级：复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('推荐信息已复制到剪贴板');
            }).catch(() => {
                showToast('分享功能暂不可用');
            });
        } else {
            showToast('分享功能暂不可用');
        }
    }
}

// ============================================
// 初始化
// ============================================

function init() {
    // 首页 -> 报名页
    document.getElementById('btn-join').onclick = () => {
        showPage('page-register');
    };

    // 报名页 -> 首页
    document.getElementById('btn-back-home').onclick = () => {
        showPage('page-home');
    };

    // 获取验证码
    document.getElementById('btn-code').onclick = sendCode;

    // 提交报名
    document.getElementById('btn-submit').onclick = submitRegister;

    // 同意条款 -> 更新提交按钮
    document.getElementById('agree-check').onchange = updateSubmitBtn;

    // 输入框变化 -> 更新提交按钮
    ['input-name', 'input-phone', 'input-code'].forEach(id => {
        document.getElementById(id).oninput = updateSubmitBtn;
    });

    // 报名页 -> 推荐页（模拟直接通过）
    // 实际由 submitRegister 的成功回调处理

    // 推荐页 -> 进度页
    document.getElementById('btn-go-progress').onclick = () => {
        showPage('page-progress');
        renderGifts();
    };

    // 分享
    document.getElementById('btn-share').onclick = shareCode;

    // 进度页 -> 首页
    document.getElementById('btn-go-home').onclick = () => {
        showPage('page-home');
    };

    // 回车提交
    document.querySelectorAll('.form-input').forEach(input => {
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                if (input.id === 'input-code') {
                    submitRegister();
                }
            }
        };
    });

    // 点击 Modal 外部关闭
    document.getElementById('modal').onclick = (e) => {
        if (e.target.id === 'modal') closeModal();
    };

    // 初始化推荐码显示
    if (mockData.user.code) {
        document.getElementById('display-code').textContent = mockData.user.code;
        document.getElementById('my-code').textContent = mockData.user.code;
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', init);
