import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-[480px]:' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
           <p className='font-semibold text-xl text-gray-600'>Last updated on 23-12-2024 16:29:06
           </p>
           <p className='text-gray-500'>Merchant Legal entity name: ADITYA PRAKASH
<br /> Registered Address: Chitkara University, Baddi, Himachal Pradesh, PIN: 174103</p>
           <p>Telephone No: 7764924355<br/> E-Mail ID: aditprakash.77@gmail.com</p>
           <p className='font-semibold text-xl text-gray-600'>Careers at Forever</p>
           <p className='text-gray-500'>Learn more about out teams and Job openings Address</p>
           <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default Contact