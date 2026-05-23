import { motion } from 'framer-motion';
import { slideUp } from '../utils/animation';

const gear = [
  { category: '相机', items: ['Sony A7M4', 'Canon EOS R5', 'Leica Q3'] },
  { category: '镜头', items: ['FE 24-70mm f/2.8 GM II', 'RF 24-105mm f/4 L', 'Summilux 28mm f/1.7'] },
  { category: '配件', items: ['Peak Design 三脚架', 'ND1000 减光镜', 'SanDisk 64GB UHS-II'] },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Avatar */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-700/50 backdrop-blur-md">
              <img
                src="https://picsum.photos/seed/photographer/400/400"
                alt="Photographer"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            className="flex-1"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-white text-3xl font-light mb-6 tracking-wide">关于我</h1>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                我是一名自由摄影师，专注于风光与城市摄影。过去五年间，我走过了20多个国家，用镜头捕捉光与影的瞬间。
              </p>
              <p>
                我的摄影哲学是「克制」——拒绝过度后期处理，让每一张照片呈现出拍摄现场最真实的色彩与氛围。
              </p>
              <p>
                曾合作品牌：National Geographic、DJI、Peak Design。
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-white font-medium text-sm tracking-wide mb-2">擅长风格</h3>
              <div className="flex flex-wrap gap-2">
                {['风光摄影', '城市建筑', '极简黑白', '航拍', '街头纪实'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs text-gray-300 bg-white/5 rounded-full border border-gray-700/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gear */}
        <motion.section
          className="mt-20"
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-white text-xl font-light mb-8 tracking-wide">设备清单</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gear.map((g) => (
              <div key={g.category} className="card-base p-6">
                <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                  {g.category}
                </h3>
                <ul className="space-y-2">
                  {g.items.map((item) => (
                    <li key={item} className="text-gray-200 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
