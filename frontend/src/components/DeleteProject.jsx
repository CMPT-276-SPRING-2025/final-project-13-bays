import { ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "../firebase-config.js"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'