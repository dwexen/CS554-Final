
import pandas as pd
import numpy as np
import scipy.sparse

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import Ridge
from sklearn.svm import SVR

data = pd.read_csv("data/dataset-fb-valence-arousal-anon.csv")
data["Valence"] = (data["Valence1"] + data["Valence2"]) / 2
data["Arousal"] = (data["Arousal1"] + data["Arousal2"]) / 2

d_val = data["Valence"]
d_aro = data["Arousal"]

data["Valence"] = (d_val - d_val.mean()) / (d_val.max() - d_val.min())
data["Arousal"] = (d_aro - d_aro.mean()) / (d_aro.max() - d_aro.min())

train, test = train_test_split(data, test_size = 0.2)

tfidf_vect = TfidfVectorizer(stop_words="english",
                             max_df=0.2,
                             ngram_range=(1, 3))

X_train_tfidf = tfidf_vect.fit_transform(train["Anonymized Message"])
X_test_tfidf = tfidf_vect.transform(test["Anonymized Message"])

def count_substr(dataset, substr):
  return np.array([
    dataset["Anonymized Message"].str.count(substr).as_matrix()
  ]).T

text_emojis = ["!", ":\)", ":\(", "=\)", "=\(", "=/", ":/", "\):",
                "\(:", "D:", ":D", ":P", "D=", "=D", "=P"]
text_emojis = []

X_train = scipy.sparse.hstack(
  [X_train_tfidf] + [count_substr(train, emoji) for emoji in text_emojis]
)

X_test = scipy.sparse.hstack(
  [X_test_tfidf] + [count_substr(test, emoji) for emoji in text_emojis]
)

features = tfidf_vect.get_feature_names()

print("Features:", X_train_tfidf.shape[1])

def print_samples(data, tfidf, prediction=None):
  for i in range(10):
    print("Sent:", data["Anonymized Message"].iloc[i])
    val, arous = data[["Valence", "Arousal"]].iloc[i]
    print("True [Valence Arousal]:", np.array([val, arous]))

    if prediction is not None:
      print("Pred [Valence Arousal]:", prediction[i])

    print("Topics:")
    for index in np.argwhere(tfidf[i])[:,1]:
      print(" ", features[index], tfidf[i, index])
    print()

#print_samples(train, X_train_tfidf)

#regressor = Ridge(normalize=False)
regressor_val = SVR(epsilon=0.2)
regressor_aro = SVR(epsilon=0.2)
regressor = MLPRegressor(verbose=True,
                         learning_rate="adaptive",
                         hidden_layer_sizes=(100,))
regressor_val = MLPRegressor(verbose=True,
                         learning_rate="adaptive",
                         hidden_layer_sizes=(100,))
regressor_aro = MLPRegressor(verbose=True,
                         learning_rate="adaptive",
                         hidden_layer_sizes=(100,))

#regressor.fit(X_train, train[["Valence", "Arousal"]])
regressor_val.fit(X_train, train["Valence"])
regressor_aro.fit(X_train, train["Arousal"])
prediction = np.vstack([regressor_val.predict(X_test),
                        regressor_aro.predict(X_test)]).T
#prediction = regressor.predict(X_test)

print_samples(test, X_test_tfidf, prediction)

def calc_mse(y, ypred):
  return ((y - ypred)**2).sum() / y.shape[0]

#rsq = regressor.score(X_test, test[["Valence", "Arousal"]])
rsq_val = regressor_val.score(X_test, test["Valence"])
rsq_aro = regressor_aro.score(X_test, test["Arousal"])
rsq = [rsq_val, rsq_aro]
mse = calc_mse(test[["Valence", "Arousal"]], prediction).as_matrix()

print("R^2:", rsq)
print("MSE:", mse)
print("SSE:", np.sqrt(mse))


def predict(sent):
  X_tfidf = tfidf_vect.transform([sent])
  X_tfidf_and_emojis = scipy.sparse.hstack(
    [X_tfidf] + [[sent.count(emoji.replace("\\", ""))] for emoji in text_emojis]
  )
  return regressor.predict(X_tfidf_and_emojis)[0]
