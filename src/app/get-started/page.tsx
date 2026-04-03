'use client';

import Link from 'next/link';

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
          {number}
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="ml-4 pl-8 border-l-2 border-slate-700">
        {children}
      </div>
    </div>
  );
}

function SubStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoBox({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const colors = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type]} mb-4`}>
      {children}
    </div>
  );
}

function FeatureTable({ headers, rows }: { headers: string[]; rows: { cells: string[]; highlight?: boolean }[] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-slate-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-700/50 ${row.highlight ? 'bg-blue-500/5' : ''}`}>
              {row.cells.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-slate-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Công cụ nạp dữ liệu mẫu</h1>
                <p className="text-sm text-slate-400">Hướng dẫn sử dụng</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all text-sm"
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 text-xl">📋</span>
            </span>
            Thông tin cần chuẩn bị
          </h2>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thông tin máy chủ xác thực</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <div>
                  <span className="font-medium text-white">Root URL:</span> Dùng để tạo link đăng nhập phía FE
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <div>
                  <span className="font-medium text-white">Client ID:</span> ID của FE app đã đăng ký với auth server
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <div>
                  <span className="font-medium text-white">Redirect URL:</span> Auth server sẽ dùng link đã đăng ký này của FE để gửi exchange code
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <div>
                  <span className="font-medium text-white">Scope:</span> Resource cần cấp phép truy cập (chọn <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">MonoTemplate</code>)
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thông tin máy chủ API backend</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <div>
                  <span className="font-medium text-white">Root URL:</span> API của backend cho FE gọi
                </div>
              </li>
            </ul>
          </div>

          <InfoBox type="warning">
            <strong>Lưu ý:</strong> Dựa vào thông tin auth server đã cung cấp, phải đăng nhập mới có thể sử dụng.
          </InfoBox>
        </section>

        {/* Step by Step Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-400 text-xl">🚀</span>
            </span>
            Hướng dẫn sử dụng
          </h2>

          <Step number="1" title="Cấu hình API">
            <p className="text-slate-400 mb-4">Trước khi bắt đầu, cần cấu hình thông tin Auth Server và Backend API.</p>
            
            <SubStep title="Cách mở Settings">
              <p className="text-slate-300 mb-3">Nhấn vào icon <strong>Settings</strong> (hình bánh răng) ở góc phải header</p>
            </SubStep>

            <SubStep title="Các trường cần điền">
              <FeatureTable
                headers={['Trường', 'Mô tả', 'Ví dụ']}
                rows={[
                  { cells: ['Địa chỉ máy chủ xác thực', 'URL của auth server', 'http://localhost:7001/'] },
                  { cells: ['Địa chỉ API backend', 'URL của backend API', 'http://localhost:7001/'] },
                  { cells: ['Client ID', 'ID đã đăng ký với auth', 'SeedingTool'] },
                  { cells: ['Redirect URI', 'URL callback (tự động điền)', 'http://localhost:3000/callback'] },
                  { cells: ['Scopes', 'Quyền truy cập', 'MonoTemplate'] },
                ]}
              />
            </SubStep>

            <SubStep title="Kiểm tra kết nối">
              <p className="text-slate-300 mb-3">Nhấn <strong>Kiểm tra kết nối</strong> để xác nhận kết nối thành công</p>
            </SubStep>

            <InfoBox type="success">
              Nhấn <strong>Lưu cài đặt</strong> để lưu lại cấu hình.
            </InfoBox>
          </Step>

          <Step number="2" title="Login">
            <p className="text-slate-400 mb-4">Sau khi cấu hình xong, hệ thống yêu cầu đăng nhập qua Auth Server.</p>
            
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">1.</span>
                Click nút <strong className="text-blue-400">Login</strong> ở góc phải header
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">2.</span>
                Hệ thống sẽ redirect sang trang đăng nhập của Auth Server
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">3.</span>
                Sau khi đăng nhập thành công, sẽ quay lại ứng dụng
              </li>
            </ul>

            <InfoBox type="success">
              Khi đã Login, sẽ hiển thị thông tin user (username/email) và nút <strong>Logout</strong> để đăng xuất.
            </InfoBox>
          </Step>

          <Step number="3" title="Chọn loại dữ liệu cần Seed">
            <p className="text-slate-400 mb-4">Từ trang chủ, chọn loại dữ liệu muốn Seed.</p>
            
              <FeatureTable
                headers={['Loại dữ liệu', 'Mô tả']}
                rows={[
                  { cells: ['VDS Event', 'Dữ liệu sự kiện từ hệ thống phát hiện phương tiện (VDS)'], highlight: true },
                  { cells: ['VDS Traffic', 'Dữ liệu traffic tổng hợp theo khoảng thời gian từ hệ thống VDS'] },
                  { cells: ['VDS Vehicle', 'Dữ liệu phương tiện nhận diện từ hệ thống VDS'] },
                ]}
              />

            <p className="text-slate-300">Nhấn vào card của loại dữ liệu cần Seed → Hệ thống sẽ chuyển sang trang Seed tương ứng</p>
          </Step>

          <Step number="4" title="Cấu hình cách gửi dữ liệu">
            <SubStep title="4.1 Chọn cách gửi dữ liệu">
              <FeatureTable
                headers={['Chế độ', 'Mô tả']}
                rows={[
                  { cells: ['Batch', 'Gửi tất cả record trong 1 request'], highlight: true },
                  { cells: ['Sequential', 'Gửi từng record một (endpoint /sequence). Dùng chung buffer backend với Concurrent.'] },
                  { cells: ['Concurrent', 'Gửi nhiều request đồng thời (endpoint /sequence). Dùng chung buffer backend với Sequential.'] },
                ]}
              />
            </SubStep>

            <SubStep title="4.2 Cấu hình số lượng record">
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <div><strong>Batch:</strong> Nhập số record cần tạo</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <div><strong>Concurrent:</strong> Nhập số request gửi đồng thời</div>
                </li>
              </ul>
            </SubStep>

            <SubStep title="4.3 Cấu hình buffer backend dùng chung (Sequential + Concurrent)">
              <p className="text-slate-300 mb-3">Khi chọn <strong>Sequential</strong> hoặc <strong>Concurrent</strong>, một panel cấu hình buffer backend dùng chung sẽ hiện ra. Hai chế độ này cùng đi qua một buffer backend, nên đổi ở đây sẽ áp dụng cho cả hai. Các giá trị này được gửi lên backend trước khi bắt đầu Seed:</p>
              <FeatureTable
                headers={['Trường', 'Mặc định', 'Ý nghĩa']}
                rows={[
                  { cells: ['Số record mỗi lô', '1000', 'Backend gom đủ số này thì flush vào database'], highlight: true },
                  { cells: ['Thời gian chờ tối đa', '60 giây', 'Backend flush lô chưa đầy sau khoảng thời gian này'] },
                ]}
              />
              <InfoBox type="info">
                Nếu không chắc nên đặt giá trị bao nhiêu, cứ để mặc định — đó là cấu hình chuẩn backend đang dùng.
              </InfoBox>
            </SubStep>

            <SubStep title="4.4 Cách tạo dữ liệu cho từng trường">
              <p className="text-slate-300 mb-4">Mỗi trường có 3 chế độ:</p>
              <FeatureTable
                headers={['Chế độ', 'Màu', 'Mô tả']}
                rows={[
                  { cells: ['Auto', '🔵 Xanh dương', 'Tự tạo ngẫu nhiên cho mỗi record'], highlight: true },
                  { cells: ['Fixed', '🟢 Xanh lá', 'Dùng một giá trị cố định do bạn nhập'] },
                  { cells: ['NULL', '⚪ Xám', 'Trường này sẽ là NULL cho tất cả record'] },
                ]}
              />

              <InfoBox type="warning">
                <strong>Lưu ý:</strong> Trường bắt buộc (có dấu *) không thể chọn NULL
              </InfoBox>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mt-4">
                <h4 className="text-white font-medium mb-3">Ví dụ cấu hình:</h4>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li>• <strong>Event Type ID:</strong> Auto (UUID ngẫu nhiên) hoặc NULL</li>
                  <li>• <strong>Source Type:</strong> Fixed = <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">1</code> (Camera)</li>
                  <li>• <strong>Zone Code:</strong> Auto để hệ thống tự lấy danh sách zone từ Master Data khi Seed</li>
                  <li>• <strong>Image URL:</strong> Auto để hệ thống random ảnh mẫu nội bộ, gắn base64 vào request VDS, rồi backend tự lưu ảnh</li>
                  <li>• <strong>Image URL:</strong> Fixed nếu nhập base64 thì hệ thống sẽ gửi thẳng base64 trong request VDS</li>
                </ul>
              </div>
            </SubStep>
          </Step>

          <Step number="5" title="Tạo Preview">
            <SubStep title="5.1 Tạo dữ liệu Preview">
              <p className="text-slate-300 mb-3">Nhấn <strong className="text-blue-400">Tạo Preview</strong> để xem trước dữ liệu trước khi Seed. Bảng Preview tự động cập nhật mỗi khi bạn thay đổi cấu hình trường.</p>
              <InfoBox type="info">
                Với <strong>Zone Code = Auto</strong> và <strong>Image URL = Auto</strong>, Preview chỉ hiển thị dữ liệu tạm. Hệ thống chỉ gọi API Master Data và chuẩn bị base64 ảnh ngay lúc bạn bấm Seed.
              </InfoBox>
            </SubStep>

            <SubStep title="5.2 Xem và chỉnh sửa">
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Hiển thị tất cả record dưới dạng bảng
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Nhấn vào ô để chỉnh sửa giá trị (chỉ trường ở chế độ <strong className="text-blue-400">Auto</strong> mới sửa được)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Trường ở chế độ Fixed hoặc NULL hiển thị ở dạng chỉ đọc
                </li>
              </ul>
            </SubStep>

            <SubStep title="5.3 Xóa Preview">
              <p className="text-slate-300">Nhấn <strong>Xóa Preview</strong> để xóa bảng Preview và quay lại chế độ cấu hình.</p>
            </SubStep>
          </Step>

          <Step number="6" title="Seed">
            <SubStep title="6.1 Chuẩn bị Seed">
              <p className="text-slate-300 mb-3">Tuỳ trạng thái, nút Seed sẽ hiển thị khác nhau:</p>
              <FeatureTable
                headers={['Trạng thái', 'Text hiển thị']}
                rows={[
                  { cells: ['Chưa cấu hình API', '"Cần cấu hình API trước — vào Settings"'] },
                  { cells: ['Chưa đăng nhập', '"Login để bắt đầu Seed"'] },
                  { cells: ['Đã đăng nhập', '"Seed X record (Batch/Sequential/Concurrent)"'], highlight: true },
                ]}
              />
            </SubStep>

            <SubStep title="6.2 Quá trình Seed">
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Hiển thị tiến độ: <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-400">Đang Seed X/Y record...</code>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Thanh tiến độ cho thấy phần trăm hoàn thành
                </li>
              </ul>
            </SubStep>

            <SubStep title="6.3 Kết quả">
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <strong className="text-emerald-400">Thành công:</strong> Hiển thị thông báo xanh, tự động biến mất sau 3 giây
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  <strong className="text-red-400">Thất bại:</strong> Hiển thị thông báo đỏ với chi tiết lỗi
                </li>
              </ul>
            </SubStep>
          </Step>
        </section>

        {/* Features Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 text-xl">✨</span>
            </span>
            Các tính năng chính
          </h2>

          <div className="grid gap-4">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">1. Cách tạo dữ liệu cho từng trường</h3>
              <FeatureTable
                headers={['Chế độ', 'Mô tả']}
                rows={[
                  { cells: ['Auto', 'Tự tạo ngẫu nhiên cho mỗi record khi Seed. Riêng Zone Code sẽ lấy từ Master Data, còn Image URL sẽ random ảnh mẫu nội bộ rồi gắn base64 trực tiếp vào request VDS để backend tự lưu ảnh'] },
                  { cells: ['Fixed', 'Nếu không muốn một trường nào đó tự tạo, bạn có thể nhập giá trị cố định. Riêng Image URL nếu nhập base64 thì hệ thống sẽ gửi thẳng base64 trong request VDS, còn URL thường sẽ gửi nguyên giá trị bạn nhập'] },
                  { cells: ['NULL', 'Trường này sẽ là NULL cho tất cả record khi Seed. Lưu ý: Trường bắt buộc không thể chọn NULL'] },
                ]}
              />
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">2. Preview dữ liệu</h3>
              <p className="text-slate-300">Nếu muốn kiểm tra kỹ trước khi Seed, bạn có thể tạo Preview và chỉnh sửa từng ô của từng record. Bảng Preview tự cập nhật khi bạn thay đổi cấu hình trường.</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">3. Cách gửi dữ liệu</h3>
              <FeatureTable
                headers={['Chế độ', 'Mô tả']}
                rows={[
                  { cells: ['Batch', 'Gửi số lượng lớn record trong một request'] },
                  { cells: ['Sequential', 'Seed từng record một. Backend dùng queue để buffer lại, sau đó insert vào database khi đủ số lượng hoặc hết thời gian chờ. Dùng chung buffer backend với Concurrent.'] },
                  { cells: ['Concurrent', 'Giả lập nhiều request gửi đồng thời (tải stress test). Dùng chung buffer backend với Sequential.'] },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Known Issues */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 text-xl">⚠️</span>
            </span>
            Vấn đề đã biết
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" disabled />
              <span className="text-slate-400">Đối với các field ID reference đến bảng khác, thì sẽ random đến các ID có sẵn <span className="text-amber-400">(chưa hoàn thiện)</span></span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" disabled />
              <span className="text-slate-400">UX đăng nhập đang rất phèn</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500" disabled />
              <span className="text-slate-400">Navigation đến các resource cần seed đang chưa có, cứ phải back ra homepage rồi vào lại rất chuối</span>
            </label>
          </div>
        </section>

        {/* Technical Notes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 text-xl">🔧</span>
            </span>
            Ghi chú kỹ thuật
          </h2>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <p className="text-slate-300">Mỗi khi import <code className="bg-slate-900 px-2 py-0.5 rounded text-purple-400">pkceAuthService</code> là lại tạo 1 instance mới, cần chuyển sang singleton toàn app.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <p className="text-slate-300">Cần có cách để phân biệt record nào trong database do seed mà có</p>
            </div>
            <div className="flex items-start gap-3 pl-4">
              <span className="text-purple-400 mt-1">→</span>
              <p className="text-slate-400">Ví dụ trong VDSEventData, có thể thêm đuôi <code className="bg-slate-900 px-2 py-0.5 rounded text-purple-400">%-SEEDED</code> vào lanecode</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/30"
          >
            <span>Vào màn hình chọn resource</span>
            <span>→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
