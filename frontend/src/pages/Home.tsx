import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl"></div>
        <div className="relative bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Chào mừng đến với{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MyApp
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Ứng dụng fullstack hiện đại được xây dựng với React, TypeScript và thiết kế Tailwind CSS đẹp mắt. 
              Trải nghiệm giao diện người dùng tuyệt vời và tính năng mạnh mẽ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 transform hover:scale-105"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá những tính năng mạnh mẽ được thiết kế để mang lại trải nghiệm tốt nhất
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Hiệu suất cao</h3>
            <p className="text-gray-600 leading-relaxed">
              Được tối ưu hóa cho hiệu suất tốt nhất với React 18 và các công nghệ hiện đại nhất
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Bảo mật</h3>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống xác thực an toàn với JWT và các biện pháp bảo mật tiên tiến
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Thân thiện</h3>
            <p className="text-gray-600 leading-relaxed">
              Giao diện người dùng trực quan và dễ sử dụng với Tailwind CSS
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 mb-16 text-white">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Thống kê ấn tượng</h2>
          <p className="text-blue-100 text-lg">Những con số nói lên chất lượng của chúng tôi</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-blue-200">Thời gian hoạt động</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">1000+</div>
            <div className="text-blue-200">Người dùng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-blue-200">Hỗ trợ khách hàng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">5⭐</div>
            <div className="text-blue-200">Đánh giá trung bình</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Sẵn sàng bắt đầu?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Tham gia cùng hàng nghìn người dùng khác đã tin tưởng và sử dụng ứng dụng của chúng tôi
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Tạo tài khoản miễn phí
          </Link>
          <Link
            to="/login"
            className="text-gray-600 hover:text-gray-800 font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
          >
            Hoặc đăng nhập ngay
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;