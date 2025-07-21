import { FC } from 'react'

const Header: FC = () => {
  return (
    <header className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md rounded-b-2xl">
      <div className="flex items-center gap-3">
        <img src="/SIS-logo-small.jpg" alt="SIS Logo" className="h-8 w-8" />
        <h1 className="text-xl font-semibold">SIS Time Tracker</h1>
      </div>
    </header>
  );
};

export default Header;