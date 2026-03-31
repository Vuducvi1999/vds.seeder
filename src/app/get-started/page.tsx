'use client';

import Image from 'next/image';
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

function InfoBox({ children, type = 'info', className = '' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success'; className?: string }) {
  const colors = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type]} mb-4 ${className}`}>
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

function ImageContainer({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-6 relative">
      <div className="relative w-full max-w-2xl mx-auto">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={400}
          className="w-full h-auto rounded-lg border border-slate-700"
          unoptimized
        />
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Data Seeder</h1>
              <p className="text-sm text-slate-400">Hướng dẫn sử dụng</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 text-xl">📋</span>
            </span>
            Requirements
          </h2>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Auth Server Information</h3>
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
            <h3 className="text-lg font-semibold text-white mb-4">Backend Server Information</h3>
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
              <p className="text-slate-300 mb-3">Click vào icon <strong>Settings</strong> (hình bánh răng) ở góc phải header</p>
              <ImageContainer src="/images/01-settings-button.svg" alt="Vị trí nút Settings" />
            </SubStep>

            <SubStep title="Giao diện Settings">
              <ImageContainer src="/images/02-settings-modal.svg" alt="Giao diện Settings Modal" />
            </SubStep>

            <SubStep title="Các trường cần điền">
              <FeatureTable
                headers={['Trường', 'Mô tả', 'Ví dụ']}
                rows={[
                  { cells: ['Auth Server URL', 'URL của auth server', 'http://localhost:7001/'] },
                  { cells: ['Backend API URL', 'URL của backend API', 'http://localhost:7001/'] },
                  { cells: ['Client ID', 'ID đã đăng ký với auth', 'SeedingTool'] },
                  { cells: ['Redirect URI', 'URL callback (tự động điền)', 'http://localhost:3000/callback'] },
                  { cells: ['Scopes', 'Quyền truy cập', 'MonoTemplate'] },
                ]}
              />
            </SubStep>

            <SubStep title="Kiểm tra kết nối">
              <p className="text-slate-300 mb-3">Click <strong>Test Connection</strong> để xác nhận kết nối thành công</p>
              <ImageContainer src="/images/03-test-connection.svg" alt="Kết quả Test Connection" />
            </SubStep>

            <InfoBox type="success">
              Click <strong>Save Settings</strong> để lưu lại cấu hình.
            </InfoBox>
          </Step>

          <Step number="2" title="Đăng nhập">
            <p className="text-slate-400 mb-4">Sau khi cấu hình xong, hệ thống yêu cầu đăng nhập qua Auth Server.</p>
            
            <SubStep title="Giao diện chưa đăng nhập">
              <ImageContainer src="/images/04-login-button.svg" alt="Nút Login" />
            </SubStep>

            <ul className="space-y-2 text-slate-300 mb-4">
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

            <SubStep title="Trạng thái đã đăng nhập">
              <ImageContainer src="/images/05-logged-in.svg" alt="Trạng thái đã đăng nhập" />
              <ul className="space-y-2 text-slate-300 mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Hiển thị thông tin user (username/email)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Nút Logout để đăng xuất
                </li>
              </ul>
            </SubStep>
          </Step>

          <Step number="3" title="Chọn Resource cần Seed">
            <SubStep title="Trang chủ - Danh sách Resources">
              <ImageContainer src="/images/06-resource-list.svg" alt="Trang chủ - Danh sách Resources" />
            </SubStep>
            
            <FeatureTable
              headers={['Resource', 'Mô tả']}
              rows={[
                { cells: ['VDS Event', 'Video Detection System Event Data'], highlight: true },
              ]}
            />

            <p className="text-slate-300 mt-4">Click vào card của resource cần seed → Hệ thống sẽ chuyển sang trang seed tương ứng</p>
          </Step>

          <Step number="4" title="Cấu hình chế độ Seed">
            <SubStep title="4.1 Chọn Seed Mode (Request Mode)">
              <ImageContainer src="/images/07-seed-mode.svg" alt="Lựa chọn Seed Mode" />
              <FeatureTable
                headers={['Mode', 'Mô tả']}
                rows={[
                  { cells: ['Batch', 'Gửi tất cả records trong 1 request'], highlight: true },
                  { cells: ['Sequential', 'Gửi từng record một (/sequence endpoint)'] },
                  { cells: ['Concurrent', 'Gửi nhiều requests đồng thời (/sequence endpoint)'] },
                ]}
              />
            </SubStep>

            <SubStep title="4.2 Cấu hình số lượng Record">
              <p className="text-slate-300 mb-3"><strong>Batch Mode:</strong></p>
              <ImageContainer src="/images/08-batch-config.svg" alt="Cấu hình số lượng Batch" />
              
              <p className="text-slate-300 mt-4 mb-3"><strong>Concurrent Mode:</strong></p>
              <ImageContainer src="/images/09-concurrent-config.svg" alt="Cấu hình Concurrent" />
            </SubStep>

            <SubStep title="4.3 Cấu hình Field Generation Mode">
              <p className="text-slate-300 mb-4">Mỗi field có 3 chế độ:</p>
              <ImageContainer src="/images/10-field-mode-selection.svg" alt="Lựa chọn Field Mode" />
              <FeatureTable
                headers={['Mode', 'Màu', 'Mô tả']}
                rows={[
                  { cells: ['Auto', '🔵 Xanh dương', 'Fake random cho mỗi record'], highlight: true },
                  { cells: ['Fixed', '🟢 Xanh lá', 'Giá trị cố định (nhập manual)'] },
                  { cells: ['NULL', '⚪ Xám', 'Để NULL cho tất cả records'] },
                ]}
              />

              <InfoBox type="warning">
                <strong>Lưu ý:</strong> Required field không thể chọn NULL
              </InfoBox>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mt-4">
                <h4 className="text-white font-medium mb-3">Ví dụ cấu hình Field:</h4>
                <ImageContainer src="/images/11-field-config-example.svg" alt="Ví dụ cấu hình Field" />
                <ul className="space-y-1 text-slate-300 text-sm mt-4">
                  <li>• <strong>Event Type:</strong> Auto (random)</li>
                  <li>• <strong>Source Type:</strong> Fixed = <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">1</code> (Camera)</li>
                  <li>• <strong>Image Path:</strong> NULL (không bắt buộc)</li>
                </ul>
              </div>
            </SubStep>
          </Step>

          <Step number="5" title="Generate & Preview Data">
            <SubStep title="5.1 Generate Preview">
              <p className="text-slate-300 mb-3">Click <strong className="text-blue-400">Generate Preview</strong> để xem trước data trước khi seed.</p>
              <ImageContainer src="/images/12-generate-preview-btn.svg" alt="Nút Generate Preview" />
            </SubStep>

            <SubStep title="5.2 Xem & Chỉnh sửa Preview">
              <ImageContainer src="/images/13-preview-table.svg" alt="Bảng Preview Data" />
              <ul className="space-y-2 text-slate-300 mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Hiển thị tất cả records dưới dạng bảng
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Click vào ô để chỉnh sửa giá trị (chỉ fields ở chế độ <strong className="text-blue-400">Auto</strong> mới sửa được)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Fields ở chế độ Fixed/NULL hiển thị disabled
                </li>
              </ul>
              <ImageContainer src="/images/14-edit-cell.svg" alt="Click để sửa" />
            </SubStep>

            <SubStep title="5.3 Xóa Preview">
              <p className="text-slate-300">Click <strong>Clear</strong> để xóa preview và quay lại chế độ cấu hình.</p>
            </SubStep>
          </Step>

          <Step number="6" title="Seed Data">
            <SubStep title="6.1 Chuẩn bị Seed">
              <p className="text-slate-300 mb-3">Tùy trạng thái, nút Seed sẽ hiển thị khác nhau:</p>
              <FeatureTable
                headers={['Trạng thái', 'Text hiển thị']}
                rows={[
                  { cells: ['Chưa cấu hình API', '"Configure API in Settings"'] },
                  { cells: ['Chưa đăng nhập', '"Login to Seed Data"'] },
                  { cells: ['Đã đăng nhập', '"Seed X Records (Batch/Sequential/Concurrent)"'], highlight: true },
                ]}
              />
              <p className="text-slate-300 mt-4 mb-3"><strong>Nút Seed (đã đăng nhập):</strong></p>
              <ImageContainer src="/images/15-seed-button-ready.svg" alt="Nút Seed sẵn sàng" />
            </SubStep>

            <SubStep title="6.2 Quá trình Seed">
              <ImageContainer src="/images/16-seeding-progress.svg" alt="Progress khi seeding" />
              <ul className="space-y-2 text-slate-300 mt-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Hiển thị progress: <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-400">Seeding X/Y...</code>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Progress bar cho thấy tiến độ
                </li>
              </ul>
            </SubStep>

            <SubStep title="6.3 Kết quả">
              <p className="text-slate-300 mb-3"><strong className="text-emerald-400">Thành công:</strong></p>
              <ImageContainer src="/images/17-result-success.svg" alt="Thông báo thành công" />
              
              <p className="text-slate-300 mt-6 mb-3"><strong className="text-red-400">Thất bại:</strong></p>
              <ImageContainer src="/images/18-result-error.svg" alt="Thông báo lỗi" />
              
              <InfoBox type="info" className="mt-4">
                Thông báo sẽ tự động biến mất sau 3 giây.
              </InfoBox>
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
              <h3 className="text-lg font-semibold text-white mb-3">1. Chọn Mode Fake Data</h3>
              <FeatureTable
                headers={['Mode', 'Mô tả']}
                rows={[
                  { cells: ['Auto', 'Fake random cho mỗi record khi seed. Đối với các field ID reference đến bảng khác, sẽ random đến các ID có sẵn'] },
                  { cells: ['Fixed', 'Nếu không muốn 1 field nào đó fake, có thể nhập manual, apply cho toàn bộ data sẽ seed'] },
                  { cells: ['NULL', 'Field NULL cho tất cả record khi seed. Lưu ý: Required field không thể chọn NULL'] },
                ]}
              />
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">2. Generate Preview</h3>
              <p className="text-slate-300">Nếu muốn chi tiết hơn, có thể generate preview và sửa manual từng field của mỗi record.</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">3. Chọn Mode Request</h3>
              <FeatureTable
                headers={['Mode', 'Mô tả']}
                rows={[
                  { cells: ['Batch', 'Gửi số lượng lớn record'] },
                  { cells: ['Sequential', 'Seed 1 record. Backend sẽ dùng cấu trúc dữ liệu dạng queue để buffer data lại, sau đó insert vào database khi đủ số lượng hoặc hết thời gian chờ'] },
                  { cells: ['Concurrent', 'Giả lập số lượng lớn sequential request gọi đồng thời'] },
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
            Known Issues
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
            Technical Notes
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
            href="/seed/vds-event"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/30"
          >
            <span>Bắt đầu Seed Data</span>
            <span>→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}