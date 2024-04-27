import Link from 'next/link';
import React from 'react';

type Props = {};

const SomethingWrong = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">Something Wrong</h1>
      <p>Please contact support.</p>
      <Link href="/" className="mt-4 bg-primary p-2 rounded-sm">
        Back to home
      </Link>
    </div>
  );
};

export default SomethingWrong;
