import React from 'react'
import { BsFillArrowRightCircleFill } from "react-icons/bs";

const SearchResult = () => {
  return (
	<div className='m-2 py-3 w-48 border-2 flex flex-row items-center justify-evenly bg-gray-100 rounded'>
		<p>A49879286F24</p>
		<BsFillArrowRightCircleFill className='w-5 h-5'/>
	</div>
  )
}

export default SearchResult