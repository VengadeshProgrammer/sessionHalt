import React from 'react'

const Nav = () => {
  return (
    <nav className='flex justify-between items-center py-2 px-8 bg-gray-800 text-white'>
        <p className='hover:cursor-pointer'>SessionHalt</p>
        <button className='hover:cursor-pointer hover:bg-gray-700 p-2 rounded-md'>Log out</button>
    </nav>
  )
}

export default Nav