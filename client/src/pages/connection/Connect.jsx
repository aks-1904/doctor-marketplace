
import React from 'react'

const Connect = () => {
  return (
    <div className="w-screen h-screen flex justify-center align-center">
        <div className='text-2xl border-2 border-black  block px-10 py-20 m-10'>
          <input type="name" placeholder='Enter Name'/>
           <input type="email" placeholder='Enter email id'/>
           <input type="code/link" placeholder='Enter meeting code '/>
           <button className='block text-2xl border-2 border-black w-full cursor-pointer'>Join room</button>
        </div>
      
    </div>
  )
}

export default Connect
