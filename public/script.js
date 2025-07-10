document.addEventListener('DOMContentLoaded', () => {
    const calorieForm = document.getElementById('calorie-form');

    calorieForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 1. Kumpulkan data dari form (TERMASUK NAMA)
        const genderInput = document.querySelector('input[name="gender"]:checked');
        if (!genderInput) {
            alert("Harap pilih jenis kelamin.");
            return;
        }

        const formData = {
            name: document.getElementById('name').value, // Ambil nilai nama
            gender: genderInput.value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            activity: parseFloat(document.getElementById('activity').value),
        };

        // Validasi sederhana di frontend
        if (!formData.name || isNaN(formData.age) || isNaN(formData.weight) || isNaN(formData.height) || isNaN(formData.activity)) {
            alert("Harap isi semua kolom dengan data yang valid.");
            return;
        }

        // 2. Kirim data ke backend menggunakan Fetch API
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            console.log('Data yang diterima dari server:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Gagal melakukan perhitungan.');
            }

            // 3. Tampilkan hasil yang diterima dari server
            displayResults(result.bmr, result.tdee, result.idealWeight);

        } catch (error) {
            console.error('Error:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
        }
    });

    function displayResults(bmr, tdee, idealWeight) {
        // Fungsi ini tidak berubah
        const resultsDiv = document.getElementById('results');
        const foodDiv = document.getElementById('food-recommendations');

        document.getElementById('bmr-result').textContent = bmr;
        document.getElementById('tdee-result').textContent = tdee;
        document.getElementById('ideal-weight-result').textContent = idealWeight;

        resultsDiv.classList.remove('hidden');
        foodDiv.classList.remove('hidden');
    }
});