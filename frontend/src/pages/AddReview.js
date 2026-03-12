import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AddReview(){
    const {facilityId} = useParams();

    const {token, user} = useContext(AuthContext);

    const [rating, setRating] = useState(5);

    const [comment, setComment] = useState("");
    const navigate = useNavigate();

    async function submit(e){
        e.preventDefault();

        try{
        const res = await fetch("http://localhost:5000/api/reviews", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },

            body: JSON.stringify({
                facility: facilityId,
                rating,
                comment,
                username: user?.username
            })
        });

        if(!res.ok){
            throw new Error("Failed to add review");
        }

        alert("Review added");
        navigate(`/facility/${facilityId}`);

    } catch (err){
        console.error(err);
    }
}

    return(
        <form onSubmit={submit} className="page-container">
            <h2>Add Review</h2>
            <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e)=> setRating(e.target.value)}
            />
            <textarea
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            />
            <button>Submit</button>
        </form>
    );
}

export default AddReview;