import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AddReview(){
    const {facilityId} = useParams();

    const {token} = useContext(AuthContext);

    const [rating, setRating] = useState(5);

    const [comment, setComment] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();
    
    async function handleSubmit(e){
        e.preventDefault();

        const formData = new FormData();
        formData.append("facility", facilityId);
        formData.append("rating", rating);
        formData.append("comment", comment);
        if (imageFile) formData.append("image", imageFile);

        try{
            const res = await fetch("http://localhost:5000/api/reviews", {
                method: "POST",
                
                headers: {
                    // "Content-Type": "application/json",
                    Authorization: token
                },
                body: formData,

            });

            if (!res.ok) throw new Error("Failed to add review");
            navigate(`/facility/${facilityId}`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        
    }


    return(
        <form onSubmit={handleSubmit} className="page-container">
            <h2>Add Review</h2>
            <label>
                Rating (1-5 Stars):
            <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e)=> setRating(Number(e.target.value))}
            />
            </label>
            <label>
                Comment:
            <textarea
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            />
            </label>
            <label>
                Upload Image (optional):
                <input type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])} />
            </label>
            <button>Submit Review</button>
        </form>
    );
}

export default AddReview;