export default function PublicFooter({ className = '' }) {
  return <footer className={`flex flex-col items-center gap-8 mb-24 px-4 text-gray-500 font-bold text-2xl w-full shrink-0 ${className}`}>
    <div className="flex gap-12 justify-center flex-wrap">
      <a href="https://api.whatsapp.com/send/?phone=6281246951339&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Whatsapp</a>
      <a href="https://www.instagram.com/cokordabagoess/" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Instagram</a>
    </div>
    <p className="text-xl mt-4 text-gray-400">Copyright © All rights reserved.</p>
  </footer>
}
