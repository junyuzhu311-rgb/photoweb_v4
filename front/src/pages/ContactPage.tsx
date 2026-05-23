import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { slideUp } from '../utils/animation';

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1
          className="text-white text-3xl font-light mb-12 tracking-wide"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          联系我
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Form */}
          <motion.form
            className="flex-1 space-y-8"
            onSubmit={handleSubmit}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            {['姓名', '邮箱', '留言'].map((label, i) => (
              <div key={label} className="relative">
                {i < 2 ? (
                  <input
                    type={i === 1 ? 'email' : 'text'}
                    required
                    placeholder={label}
                    className="w-full bg-transparent border-b border-gray-700 py-3 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 transition-colors duration-300"
                  />
                ) : (
                  <textarea
                    required
                    rows={4}
                    placeholder={label}
                    className="w-full bg-transparent border-b border-gray-700 py-3 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 transition-colors duration-300 resize-none"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={sending || sent}
              className="btn-base rounded-lg text-sm"
            >
              {sending ? '发送中...' : sent ? '已发送' : '发送消息'}
            </button>
          </motion.form>

          {/* Contact info */}
          <motion.div
            className="flex-1 space-y-6"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="card-base p-6">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">
                联系方式
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500">邮箱</span>
                  <p className="text-gray-200 mt-1">
                    <a href="mailto:hello@example.com" className="hover:text-white transition-colors">
                      hello@example.com
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Instagram</span>
                  <p className="text-gray-200 mt-1">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      @photographer
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">微信</span>
                  <p className="text-gray-200 mt-1">photographer_wx</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
